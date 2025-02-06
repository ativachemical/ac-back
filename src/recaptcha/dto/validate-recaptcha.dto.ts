import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateRecaptchaDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'TOKEN_GERADO_NO_FRONTEND' })
    recaptchaToken: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '192.168.1.1', required: false })
    recaptchaClientIp?: string;
}
