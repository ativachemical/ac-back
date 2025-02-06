import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateRecaptchaDto } from './dto/validate-recaptcha.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaService {
    private readonly RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    private readonly RECAPTCHA_API_URL = process.env.RECAPTCHA_API_URL;

    constructor(private readonly httpService: HttpService) { }
F
    async validateRecaptcha(dto: ValidateRecaptchaDto): Promise<boolean> {
        const params = new URLSearchParams();
        params.append('secret', this.RECAPTCHA_SECRET_KEY);
        params.append('response', dto.recaptchaToken);
        if (dto.recaptchaClientIp) params.append('remoteip', dto.recaptchaClientIp); // Opcional, melhora segurança

        try {
            const response = await firstValueFrom(
                this.httpService.post<{ success: boolean; 'error-codes'?: string[] }>(
                    this.RECAPTCHA_API_URL,
                    params,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                )
            );

            const { success, ['error-codes']: errorCodes } = response.data;

            if (success) {
                return true;
            }

            console.error('Erro na validação do reCAPTCHA:', errorCodes);
            throw new UnauthorizedException('Invalid reCAPTCHA token');
        } catch (error) {
            console.error('Erro na validação do reCAPTCHA:', error);
            throw new UnauthorizedException('Invalid reCAPTCHA token');
        }
    }
}
