import { Injectable } from '@nestjs/common';
import { RecaptchaResponse } from './interfaces/recaptcha-response.interface';
import { ValidateRecaptchaDto } from './dto/validate-recaptcha.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaService {
    private readonly RECAPTCHA_API_URL = process.env.RECAPTCHA_API_URL;
    private readonly RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    private readonly RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

    constructor(private readonly httpService: HttpService) { }

    async validateRecaptcha(dto: ValidateRecaptchaDto): Promise<boolean> {
        const requestBody = {
            event: {
                token: dto.token,
                expectedAction: dto.expectedAction,
                siteKey: this.RECAPTCHA_SITE_KEY,
            },
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post<RecaptchaResponse>(`${this.RECAPTCHA_API_URL}?key=${this.RECAPTCHA_SECRET_KEY}`, requestBody)
            );

            const { riskAnalysis, tokenProperties } = response.data;

            // O reCAPTCHA é considerado válido se:
            // - O token é válido
            // - A ação esperada corresponde à ação do token
            // - A pontuação de risco é alta (normalmente acima de 0.5)
            if (tokenProperties.valid && tokenProperties.action === dto.expectedAction && riskAnalysis.score >= 0.5) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro na validação do reCAPTCHA:', error);
            return false;
        }
    }
}
