import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { getPath } from '../utils';

@Injectable()
export class EmailService {
  private transporter;
  private readonly primaryColor: string = '#1e83cc';
  private readonly backgroundPrimaryColor: string = '#f3f2f0';
  private readonly backgroundSecondaryColor: string = '#ffffff';
  private readonly textFooter: string = '#9e9e9e';

  constructor(
    private prisma: PrismaService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      disableFileAccess: false, // Evita caching em arquivos
      disableUrlAccess: true, // Evita caching de URLs
      pool: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD, // Use variáveis de ambiente para segurança
      },
    });
  }

  async sendEmailProductAtached(
    to: string,
    subject: string,
    userName: string,
    fileArchivedName: string,
    routeFileArchived: string,
  ) {
    const path = require('path');
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html: `
        <!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email de Confirmação</title>
  </head>
  <body style="font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', Helvetica, Arial, sans-serif; background-color: ${this.backgroundPrimaryColor}; margin: 0; padding: 20px; color: #444444;">
    <table role="presentation" width="100%" style="max-width: 500px; margin: 0 auto; background-color: ${this.backgroundSecondaryColor}; padding: 20px; border-radius: 20px;">
      <tr>
        <td style="text-align: center; margin-bottom: 24px;">
          <a href="https://ativachemical.com" target="_blank">
            <img src="cid:logo" alt="Logo" style="width: 250px;" />
          </a>
        </td>
      </tr>
        <tr>
            <td style="text-align: center;">
                <h1>${subject}</h1>
                <p style="font-size:16px;">
                    Olá
                    <span style="color: ${this.primaryColor}; font-weight: bold; font-size:15px;">${userName}</span>!
                    <br>
                    Agradecemos por acessar nosso site e demonstrar interesse em saber mais sobre nossos produtos. 
                    Fale com um consultor! 
                    <a href="https://api.whatsapp.com/send/?phone=5511975840851&text=Ol%C3%A1%2C%20sou%20o%20${userName}%2C%20poderia%20me%20ajudar%3F" target="_blank" style="color: #1f89d5; font-weight: bold;">Acesse aqui</a>
                </p>
            </td>
        </tr>
    </table>

    <!-- Seção fora do box com background transparente -->
    <table role="presentation" width="100%" style="max-width: 500px; margin: 20px auto 0 auto; text-align: center;">
      <tr>
        <td style="text-align: center;">
          <p style="color: ${this.primaryColor}; margin-bottom: 5px;">
            <a href="https://www.ativachemical.com" style="color: ${this.primaryColor}; font-weight: bold; text-decoration: none;">www.ativachemical.com</a>
          </p>
          <p style="color: ${this.textFooter};">&copy; ${new Date().getFullYear()} Ativa Chemical. Todos os direitos reservados.</p>
        </td>
      </tr>
    </table>

  </body>
</html>
      `,
      attachments: [
        {
          filename: fileArchivedName,
          path: routeFileArchived,
          // currentType:'',
        },
        {
          filename: 'logoAC.png',
          path: getPath('src/assets/img/logoAC.png'), // Caminho absoluto para a imagem
          cid: 'logo', // CID usado para referenciar a imagem no HTML
        },
      ],
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Erro ao enviar e-mail: ${error.message}`);
    }
  }
}
