import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import http from "node:http";
import createApp from "./app.js";
import { env } from "./config/env.js";

if (cluster.isPrimary) {
  const maxWorkersAllowed = Math.max(1, availableParallelism() - 1);
  console.log(
    `Primary process ${process.pid} will run ${maxWorkersAllowed} workers.`,
  );

  let workers: { id: number; port: number }[] = [];

  for (let i = 0; i < maxWorkersAllowed; i++) {
    const workerPort = Number(env.PORT) + i + 1;

    const worker = cluster.fork({ WORKER_PORT: workerPort });
    workers.push({ id: worker.id, port: workerPort });
  }

  let currentWorker = 0;

  const lb = http.createServer((req, res) => {
    if (!req.url?.startsWith("/api")) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          error: "Not Found",
          message: `Route ${req.method} ${req.url} not found`,
        }),
      );
      return;
    }

    const targetWorker = workers[currentWorker];
    currentWorker = (currentWorker + 1) % workers.length;

    console.log(
      `Request ${req.method} ${req.url} redirected to port ${targetWorker.port}`,
    );

    const connector = http.request(
      {
        hostname: env.HOST,
        port: targetWorker.port,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          "x-forwarded-host": req.headers.host,
          host: `localhost:${targetWorker.port}`,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    connector.on("error", () => {
      res.writeHead(502);
      res.end(
        JSON.stringify({
          error: "Bad Gateway",
          message: "Couldn't process the request",
        }),
      );
    });

    req.pipe(connector);
  });

  lb.listen(env.PORT, () => {
    console.log(`Load balancer is running on ${env.PORT}`);
  });

  cluster.on("exit", (worker) => {
    const stoppedWorker = workers.find((w) => w.id === worker.id);
    console.error(`Worker ${worker.process.pid} is stopped. Restarting...`);
    if (!stoppedWorker) {
      throw new Error(`Unknown worker ${worker.id} stopped`);
    }

    const newWorker = cluster.fork({ WORKER_PORT: stoppedWorker.port });

    workers = workers.filter((w) => w.id !== stoppedWorker.id);
    workers.push({ id: newWorker.id, port: stoppedWorker.port });
  });

  const stopAll = async (signal: "SIGINT" | "SIGTERM") => {
    lb.close();

    for (const worker of Object.values(cluster.workers || {})) {
      worker?.kill(signal);
    }
    process.exit(0);
  };

  process.on("SIGINT", () => stopAll("SIGINT"));
  process.on("SIGTERM", () => stopAll("SIGTERM"));
} else {
  const port = Number(process.env.WORKER_PORT) || env.PORT;
  const app = createApp();

  try {
    await app.listen({ host: env.HOST, port: port });
    console.error(`Worker ${process.pid} is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await app.close();
        process.exit(0);
      } catch (err) {
        console.error(
          `Error while closing process ${process.pid} on port ${port}`,
          err,
        );
        process.exit(1);
      }
    });
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
