import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Segment } from './enums/segment';

export class CreateItemInTableDto {
  @ApiProperty({ example: 'Nome Comercial' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Cloreto de Sódio' })
  @IsNotEmpty()
  @IsString()
  readonly value: string;
}

export class CreateTopicDto {
  @ApiProperty({ example: 'Pureza' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'A pureza do produto pode variar entre 90% e 95%' })
  @IsNotEmpty()
  @IsString()
  readonly value: string;
}

export class CreateSpecificationDto {
  @ApiProperty({ example: 'Composição Química' })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: ['Pureza', 'Densidade', 'Solubilidade', 'Composição Química'],
  })
  @IsArray()
  @IsString({ each: true })
  readonly headers: string[];

  @ApiProperty({
    example: [
      ['row1', 'row1', 'row1', 'row1', 'row1', 'row1'],
      ['row2', 'row2', 'row2', 'row2', 'row2', 'row2'],
      ['row3', 'row3', 'row3', 'row3', 'row3', 'row3'],
      ['row4', 'row4', 'row4', 'row4', 'row4', 'row4'],
    ],
  })
  @IsArray()
  @IsString({ each: true })
  readonly rows: string[][];
}

export class CreateProductSpecificationTsvDto {
  @ApiProperty({ example: 'Cloreto de Sódio - Swagger specification Tsv' })
  @IsString()
  readonly product_title: string;

  @ApiProperty({
    example: [
      'agricultura',
      'tintas_e_resinas',
      'tratamento_de_agua',
      'cuidados_em_casa',
    ],
  })
  @IsString()
  readonly segments: Segment[];

  @ApiProperty({
    type: [CreateItemInTableDto],
    example: [
      {
        name: 'Nome Comercial',
        value: 'Cloreto de Sódio',
      },
      {
        name: 'Nome Químico',
        value: 'Nome químico',
      },
      {
        name: 'Função',
        value: 'Função',
      },
      {
        name: 'Aplicação',
        value: 'Aplicação',
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemInTableDto)
  readonly item_in_table: CreateItemInTableDto[];

  @ApiProperty({
    type: [CreateTopicDto],
    example: [
      {
        name: 'Pureza',
        value: 'A pureza do produto pode variar entre 90% e 95%',
      },
      {
        name: 'Densidade',
        value: 'A densidade é de 1.32 g/cm³ a 20°C',
      },
      {
        name: 'Solubilidade',
        value:
          'Solúvel em água a uma concentração de aproximadamente 360g/L a 20°C.',
      },
      {
        name: 'Composicao Química',
        value: 'Cl- (íon cloreto): 60.66%, Na+ (íon sódio): 39.34%',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTopicDto)
  readonly topics: CreateTopicDto[];

  @ApiProperty({
    type: String,
    example:
      'Header1\tHeader2\tHeader3\tHeader4\r\nrow1\trow1\trow1\trow1\trow1\trow1\r\nrow2\trow2\trow2\trow2\trow2\trow2',
  })
  @ValidateNested()
  @Type(() => String)
  readonly data: string;
}

export class CreateProductSpecificationJsonDto {
  @ApiProperty({ example: 'Cloreto de Sódio - Swagger specification Json' })
  @IsString()
  readonly product_title: string;

  @ApiProperty({
    type: [CreateItemInTableDto],
    example: [
      {
        name: 'Nome Comercial',
        value: 'Cloreto de Sódio',
      },
      {
        name: 'Nome Químico',
        value: 'Nome químico',
      },
      {
        name: 'Função',
        value: 'Função',
      },
      {
        name: 'Aplicação',
        value: 'Aplicação',
      },
      {
        name: 'Segmentos',
        value: [
          'agricultura',
          'tintas_e_resinas',
          'tratamento_de_agua',
          'cuidados_em_casa',
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemInTableDto)
  readonly item_in_table: CreateItemInTableDto[];

  @ApiProperty({
    type: [CreateTopicDto],
    example: [
      {
        name: 'Pureza',
        value: 'A pureza do produto pode variar entre 90% e 95%',
      },
      {
        name: 'Densidade',
        value: 'A densidade é de 1.32 g/cm³ a 20°C',
      },
      {
        name: 'Solubilidade',
        value:
          'Solúvel em água a uma concentração de aproximadamente 360g/L a 20°C.',
      },
      {
        name: 'Composicao Química',
        value: 'Cl- (íon cloreto): 60.66%, Na+ (íon sódio): 39.34%',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTopicDto)
  readonly topics: CreateTopicDto[];

  @ApiProperty({
    type: CreateSpecificationDto,
    example: {
      title: 'Composição Química',
      headers: ['Pureza', 'Densidade', 'Solubilidade', 'Composição Química'],
      rows: [
        ['row1', 'row1', 'row1', 'row1', 'row1', 'row1'],
        ['row2', 'row2', 'row2', 'row2', 'row2', 'row2'],
      ],
    },
  })
  @ValidateNested()
  @Type(() => CreateSpecificationDto)
  readonly data: CreateSpecificationDto;
}
