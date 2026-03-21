import crypto from "node:crypto";
import { Product, ProductData } from "./types/product.js";

let products: Product[] = [];

const getAll = () => {
  return products;
};

const getById = (id: string) => {
  return products.find((p) => p.id === id);
};

const create = (data: ProductData) => {
  const newProduct = {
    ...data,
    id: crypto.randomUUID(),
  };
  products.push(newProduct);

  return newProduct;
};

const update = (id: string, data: ProductData) => {
  const updatedProduct = {
    ...data,
    id: id,
  };

  products = products.map((p) => (p.id === id ? updatedProduct : p));

  return updatedProduct;
};

const deleteFn = (id: string) => {
  products = products.filter((p) => p.id !== id);
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteFn,
};
