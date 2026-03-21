import z from "zod";
import { NotFoundError } from "../errors.js";
import ProductORM from "../productsState.js";
import { Product, ProductCategory } from "../types/product.js";
import { createAction } from "../utils/createAction.js";

const paramsSchema = z.object({
  id: z.uuid(),
});

const bodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().int().positive(),
  category: z.enum(ProductCategory),
  inStock: z.boolean(),
});

export const getAllProductsAction = createAction({
  handler: async (): Promise<Product[]> => {
    return ProductORM.getAll();
  },
});

export const getProductByIdAction = createAction({
  schema: {
    params: paramsSchema,
  },
  handler: async (request): Promise<Product> => {
    const product = ProductORM.getById(request.params.id);
    if (!product) {
      throw new NotFoundError(
        `Product with id ${request.params.id} is not found`,
      );
    }
    return product;
  },
});

export const createProductAction = createAction({
  successCode: 201,
  schema: {
    body: bodySchema,
  },
  handler: async (request): Promise<Product> => {
    return ProductORM.create(request.body);
  },
});

export const updateProductAction = createAction({
  schema: {
    params: paramsSchema,
    body: bodySchema,
  },
  handler: async (request): Promise<Product> => {
    const product = ProductORM.getById(request.params.id);
    if (!product) {
      throw new NotFoundError(
        `Product with id ${request.params.id} is not found`,
      );
    }

    return ProductORM.update(request.params.id, request.body);
  },
});

export const deleteProductAction = createAction({
  successCode: 204,
  schema: {
    params: paramsSchema,
  },
  handler: async (request): Promise<undefined> => {
    const isProductExist = ProductORM.getById(request.params.id);

    if (!isProductExist) {
      throw new NotFoundError(
        `Product with id ${request.params.id} is not found`,
      );
    }

    ProductORM.delete(request.params.id);
  },
});
