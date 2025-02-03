import { Controller, Post, Body } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import { ValidateRecaptchaDto } from './dto/validate-recaptcha.dto';
import { RecaptchaResponse } from './dto/recaptcha-response.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('recaptcha')
@ApiTags('recaptcha')
export class RecaptchaController {
    constructor(private readonly recaptchaService: RecaptchaService) { }

    @Post('validate')
    async validate(@Body() dto: ValidateRecaptchaDto): Promise<RecaptchaResponse> {
        const isValid = await this.recaptchaService.validateRecaptcha(dto);

        if (!isValid) {
            return { success: false, message: 'reCAPTCHA inválido' };
        }

        return { success: true, message: 'reCAPTCHA válido', timestamp: new Date().toISOString() };
    }
}
