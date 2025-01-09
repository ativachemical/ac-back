import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { Segment } from '../../product/enums/segment';

export class Topics {
    key: string;
    value: string;
}

export class GenerateProductPdf {
    product_id: number;
    product_name: string;
    product_image: string;
    segments: Segment[];
    topicsFixed: Topics[]
    topics: Topics[]
    table: string[][];
    data_request: string;
}
