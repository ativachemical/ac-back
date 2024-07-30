import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSegmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class CreateItemInTableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value ?? '-')
  readonly value: string;
}

export class CreateTopicDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly value: string;
}

export class CreateSpecificationHeaderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class CreateSpecificationRowDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly value: string;
}

export class CreateSpecificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({ type: [CreateSpecificationHeaderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecificationHeaderDto)
  readonly headers: CreateSpecificationHeaderDto[];

  @ApiProperty({ type: [CreateSpecificationRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecificationRowDto)
  readonly rows: CreateSpecificationRowDto[];
}

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly product_title: string;

  @ApiProperty({ type: [CreateSegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSegmentDto)
  readonly segments: CreateSegmentDto[];

  @ApiProperty({ type: [CreateItemInTableDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemInTableDto)
  readonly itemInTable: CreateItemInTableDto[];

  @ApiProperty({ type: [CreateTopicDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTopicDto)
  readonly topics: CreateTopicDto[];

  @ApiProperty({ type: CreateSpecificationDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateSpecificationDto)
  readonly data: CreateSpecificationDto;
}
