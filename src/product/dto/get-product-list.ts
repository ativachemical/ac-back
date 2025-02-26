import { ApiProperty } from '@nestjs/swagger';

export class ProductListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  is_inactived: boolean;

  @ApiProperty()
  is_deleted: boolean;
  
  @ApiProperty()
  rows: (string | any[])[];
}
export class GetProductListDto {
  @ApiProperty({ type: [String] })
  headers: string[];

  @ApiProperty({ type: [ProductListItemDto] })
  items: ProductListItemDto[];
}
