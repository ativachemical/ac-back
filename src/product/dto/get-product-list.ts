// src/products/dto/get-product-list.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  is_inactived: boolean;
  @ApiProperty()
  rows: (string | string[])[];
}
export class GetProductListDto {
  @ApiProperty({ type: [String] })
  headers: string[];

  @ApiProperty({ type: [ProductListItemDto] })
  items: ProductListItemDto[];
}
