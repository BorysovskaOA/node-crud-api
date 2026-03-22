import crypto from "node:crypto";
import fs from "node:fs";
import { Product, ProductData } from "../types/product.js";

const PRODUCT_FILE = "./products.json";

// Ініціалізація файлу, якщо його немає
if (!fs.existsSync(PRODUCT_FILE))
  fs.writeFileSync(PRODUCT_FILE, JSON.stringify([]));

// Should be sync because otherwise multi mode can override by other worker
const readData = (): Product[] =>
  JSON.parse(fs.readFileSync(PRODUCT_FILE, "utf-8"));
const writeData = (data: Product[]) =>
  fs.writeFileSync(PRODUCT_FILE, JSON.stringify(data, null, 2));

const getAll = () => readData();

const getById = (id: string) => {
  const products = readData();
  return products.find((p) => p.id === id);
};

const create = (data: ProductData) => {
  const products = readData();
  const newProduct = {
    ...data,
    id: crypto.randomUUID(),
  };

  products.push(newProduct);
  writeData(products);
  return newProduct;
};

const update = (id: string, data: ProductData) => {
  const products = readData();
  const updatedProduct = {
    ...data,
    id: id,
  };

  const updatedProducts = products.map((p) =>
    p.id === id ? updatedProduct : p,
  );
  writeData(updatedProducts);
  return updatedProduct;
};

const deleteFn = (id: string) => {
  const products = readData();
  const updatedProducts = products.filter((p) => p.id !== id);

  writeData(updatedProducts);
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteFn,
};
