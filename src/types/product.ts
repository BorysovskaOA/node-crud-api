export enum ProductCategory {
  Electronics = "electronics",
  Books = "books",
  Clothing = "clothing",
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  inStock: boolean;
}

export interface Product extends ProductData {
  id: string;
}
