import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateRecaptchaDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    recaptchaToken: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '',
    })
    recaptchaAction: string;
}
