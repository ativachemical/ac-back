import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateRecaptchaDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    token: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    expectedAction: string;
}
