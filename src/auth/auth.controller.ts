import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto, LoginRequest } from './dto/login.dto';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { ValidateRecaptchaDto } from '../recaptcha/dto/validate-recaptcha.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recaptchaService: RecaptchaService
  ) { }

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() loginRequest: LoginRequest) {
    const { email, password, recaptchaToken, recaptchaClientIp } = loginRequest;

    // Criando um objeto do tipo ValidateRecaptchaDto
    const recaptchaDto = new ValidateRecaptchaDto();
    recaptchaDto.recaptchaToken = recaptchaToken;
    recaptchaDto.recaptchaClientIp = recaptchaClientIp;

    // Chamando a validação
    await this.recaptchaService.validateRecaptcha(recaptchaDto);

    return this.authService.login(email, password);
  }
}
