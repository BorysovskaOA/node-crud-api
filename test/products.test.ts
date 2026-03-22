import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import createApp from "../src/app.js";
import ProductORM from "../src/db/productORM.js";
import z from "zod";
import { ProductCategory, ProductData } from "../src/types/product.js";

const productBody: ProductData = {
  name: "iPhone 18",
  description: "Mobile phone",
  price: 12300,
  category: ProductCategory.Electronics,
  inStock: true,
};
const app = createApp();

beforeEach(() => {
  ProductORM.getAll().forEach((e) => {
    ProductORM.delete(e.id);
  });
});

describe("Products API", () => {
  test("returns initially empty", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepEqual(response.json(), []);
  });

  test("creates product", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      body: productBody,
    });

    assert.strictEqual(response.statusCode, 201);
    assert.partialDeepStrictEqual(response.json(), productBody);
    assert.doesNotThrow(() => z.uuid().parse(response.json().id));
  });

  test("retrieves product by id", async () => {
    const savedProduct = ProductORM.create(productBody);
    const response = await app.inject({
      method: "GET",
      url: `/api/products/${savedProduct.id}`,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), savedProduct);
  });

  test("updates product", async () => {
    const savedProduct = ProductORM.create(productBody);
    const productUpdateData = {
      ...savedProduct,
      description: "Mobile phone Apple",
    };

    const response = await app.inject({
      method: "PUT",
      url: `/api/products/${savedProduct.id}`,
      body: productUpdateData,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), productUpdateData);
  });

  test("deletes product", async () => {
    // Deletes product
    const savedProduct = ProductORM.create(productBody);
    const responseDelete = await app.inject({
      method: "DELETE",
      url: `/api/products/${savedProduct.id}`,
    });

    assert.strictEqual(responseDelete.statusCode, 204);

    // Checks cannot retrieve that product anymore
    const responseGet = await app.inject({
      method: "GET",
      url: `/api/products/${savedProduct.id}`,
    });

    assert.strictEqual(responseGet.statusCode, 404);
  });

  test("validates price", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      body: {
        ...productBody,
        price: -123,
      },
    });

    assert.strictEqual(response.statusCode, 400);
    assert.ok(
      response
        .json()
        .details.some(
          (d: { field: string; message: string }) =>
            d.field === "price" && d.message.includes("Too small"),
        ),
    );
  });

  test("validates missing fields in body", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      body: {},
    });

    assert.strictEqual(response.statusCode, 400);
    assert.ok(
      Object.keys(productBody).every((key) =>
        response.json().details.some((d: { field: string }) => d.field === key),
      ),
    );
  });

  test("validates invalid category", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      body: { ...productBody, category: "phones" },
    });

    assert.strictEqual(response.statusCode, 400);
    assert.ok(
      response
        .json()
        .details.some(
          (d: { field: string; message: string }) =>
            d.field === "category" && d.message.includes("Invalid option"),
        ),
    );
  });

  test("validates invalid id", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/products/${1}`,
    });

    assert.strictEqual(response.statusCode, 400);
    assert.ok(
      response
        .json()
        .details.some(
          (d: { field: string; message: string }) =>
            d.field === "id" && d.message.includes("Invalid UUID"),
        ),
    );
  });

  test("returns 404 on not existend id for get", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/products/${crypto.randomUUID}`,
    });

    assert.strictEqual(response.statusCode, 404);
  });

  test("returns 404 on not existend id for update", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/products/${crypto.randomUUID}`,
      body: productBody,
    });

    assert.strictEqual(response.statusCode, 404);
  });

  test("returns 404 on not existend id for delete", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/api/products/${crypto.randomUUID}`,
    });

    assert.strictEqual(response.statusCode, 404);
  });
});
