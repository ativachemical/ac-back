export interface ItemInTable {
  name: string;
  value: string;
}

export interface Topic {
  name: string;
  value: string;
}
export interface ProductData {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Product {
  id: number;
  product_title: string;
  segments: string[];
  item_in_table: ItemInTable[];
  topics: Topic[];
  data: ProductData;
}
