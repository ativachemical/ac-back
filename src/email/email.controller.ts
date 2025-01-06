import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestEmailProductDownload } from './dto/email.dto';
import { EmailService } from './email.service';

@Controller('email')
@ApiTags('Email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}
}
