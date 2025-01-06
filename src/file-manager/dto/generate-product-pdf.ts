import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { Segment } from 'src/product/enums/segment';

export class Topics {
    key: string;
    value: string;
}

export class GenerateProductPdf {
    product_name: string;
    product_image: string;
    segments: Segment[];
    topics: Topics[]
    table: string[][];
}
