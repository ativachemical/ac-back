import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateRecaptchaDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    rechaptchaToken: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    rechaptchaAction: string;
}
