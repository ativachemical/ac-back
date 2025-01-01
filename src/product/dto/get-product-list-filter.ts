import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
  IsNotEmpty,
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

  @ApiProperty({
    example: 2,
    description: 'Limitar retorno dos valores nas colunas.',
    required: false,
  })
  @IsNotEmpty()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 2))
  @IsInt()
  limit_string: number = 25;

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
      ColumnHeader.Download,
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

  @ApiProperty({
    example: false,
    description: 'Filtrar produtos deletados.',
  })
  @IsBoolean()
  is_deleted: boolean;
}
