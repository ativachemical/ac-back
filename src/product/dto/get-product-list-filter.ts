import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Segment } from './enums/segment';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ColumnHeader } from './enums/column-header';

export class GetProductListFilterDto {
  @ApiProperty()
  @IsString()
  @ApiProperty({
    example: '',
    description: 'Termo de busca para filtrar os produtos.',
  })
  search?: string;

  @ApiProperty()
  @IsString()
  @ApiProperty({
    description: 'Lista de colunas a serem retornadas.',
    example: [
      ColumnHeader.NomeComercial,
      ColumnHeader.NomeQuimico,
      ColumnHeader.Funcao,
      ColumnHeader.Aplicacao,
      ColumnHeader.Segmentos,
    ],
    isArray: true,
    enum: ColumnHeader,
  })
  columns?: ColumnHeader[];

  @ApiProperty({
    description: 'Array of segments to filter products',
    example: [
      Segment.Agricultura,
      Segment.TintasEResinas,
      Segment.TratamentoDeAgua,
      Segment.CuidadosEmCasa,
    ],
    isArray: true,
    enum: Segment,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Segment, { each: true })
  segments?: Segment[];

  @ApiProperty({
    example: false,
    description: 'Filtrar produtos inativos.',
  })
  @IsBoolean()
  is_inactived: boolean;
}
