import { Module } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import { RecaptchaController } from './recaptcha.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RecaptchaController],
  providers: [RecaptchaService],
  exports: [RecaptchaService],
})
export class RecaptchaModule { }
