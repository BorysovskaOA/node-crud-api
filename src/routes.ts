import { FastifyPluginAsync } from "fastify";
import {
  getAllProductsAction,
  getProductByIdAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "./controllers/products.js";

const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", getAllProductsAction);
  app.post("/", createProductAction);
  app.get("/:id", getProductByIdAction);
  app.put("/:id", updateProductAction);
  app.delete("/:id", deleteProductAction);
};

export const routes: FastifyPluginAsync = async (app) => {
  app.register(productRoutes, { prefix: "/products" });
};
