import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductEnums {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  readonly value: string[];
}

export class ProductTopics {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Cloreto de Sódio - Swagger specification Tsv' })
  @IsString()
  @IsNotEmpty()
  readonly product_title: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  readonly is_inactived?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  readonly is_deleted?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Cloreto de Sódio' })
  readonly comercial_name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Nome químico' })
  readonly chemical_name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Função' })
  readonly function?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Aplicação' })
  readonly application?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductEnums)
  @ApiProperty({
    type: [ProductEnums],
    example: [
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
  readonly product_enums?: ProductEnums[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
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
  @ValidateNested({ each: true })
  @Type(() => ProductTopics)
  readonly topics?: ProductTopics[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    example:
      'Header1\tHeader2\tHeader3\tHeader4\r\nrow1\trow1\trow1\trow1\trow1\trow1\r\nrow2\trow2\trow2\trow2\trow2\trow2',
  })
  readonly data?: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary',})
  // readonly image?: Buffer;
  readonly image?: Express.Multer.File;
}
