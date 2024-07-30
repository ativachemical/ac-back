import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Segment } from './enums/segment';
import { ApiProperty } from '@nestjs/swagger';

export class GetProductListFilterDto {
  @ApiProperty()
  @IsString()
  search?: string;


  @ApiProperty({
    description: 'Array of segments to filter products',
    example: [
      'agricultura',
      'tintas_e_resinas',
      'tratamento_de_agua',
      'cuidados_em_casa',
    ],
    isArray: true,
    enum: Segment,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Segment, { each: true })
  segments?: Segment[];

  @ApiProperty()
  @IsBoolean()
  is_active: boolean;
}
