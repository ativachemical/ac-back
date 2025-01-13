import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tornar a pasta "assets" pública
  app.use('/assets', express.static(join(__dirname, '..', 'assets')));

  // Configuração CORS dinâmica para múltiplas origens
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://ativachemical-development.vercel.app',
        'http://localhost:3000',
        'http://localhost:3000/products',
        'http://localhost:5000',
        'https://ac-back.onrender.com',
        'https://ac-back.vercel.app',
        'https://www.ativachemical.com',
        'https://ativachemical.com',
        'https://ac-back.onrender.com/product/filter',
        'https://ac-front.vercel.app',
        'https://ac-front-git-development-ativachemicals-projects.vercel.app',
        'ac-front-ativachemicals-projects.vercel.app',
      ];

      if (allowedOrigins.includes(origin) || origin === undefined) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription(
      'A progressive Node.js framework for building efficient and scalable server-side applications.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      url: '/swagger/swagger.json', // O URL do arquivo JSON
    },
  });

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  if (process.env.NODE_ENV === 'development') {
    const pathToSwaggerStaticFolder = resolve(process.cwd(), 'swagger-static');

    if (!existsSync(pathToSwaggerStaticFolder)) {
      mkdirSync(pathToSwaggerStaticFolder);
    }

    const pathToSwaggerJson = resolve(
      pathToSwaggerStaticFolder,
      'swagger.json',
    );
    const swaggerJson = JSON.stringify(document, null, 2);
    writeFileSync(pathToSwaggerJson, swaggerJson);
    console.log(`Swagger JSON file written to: '/swagger-static/swagger.json'`);
  }

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
