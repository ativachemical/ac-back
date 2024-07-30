export interface ProductListItem {
  id: number;
  rows: (string | string[])[];
}

export interface GetProductList {
  headers: string[];
  items: ProductListItem[];
}
