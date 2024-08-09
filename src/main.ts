import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração CORS dinâmica para múltiplas origens
  app.enableCors({
    origin: (origin, callback) => {
      // Allow undefined origins (e.g., Swagger UI, server-to-server, Postman)
      console.log('Request Origin:', origin);
      if (!origin) {
        return callback(null, true);
      }

      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://www.ativachemical.com',
        'https://ativachemical.com',
        'https://ac-front.vercel.app',
        'https://ac-front-git-development-ativachemicals-projects.vercel.app',
        'https://ac-front-ativachemicals-projects.vercel.app',
      ];

      //Permitir acesso à rota /swagger
      if (origin.includes('/swagger')) {
        return callback(null, true);
      }
      // Allow if origin is in the allowedOrigins array
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('CORS Blocked Origin:', origin); 

      // If none of the above, deny with CORS error
      return callback(new Error('Not allowed by CORS'));
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
    credentials: true,
  });

  // Middleware para bloquear acesso fora da rota /swagger
  app.use((req: Request, res, next) => {
    if (req.originalUrl.startsWith('/swagger')) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access Forbidden' });
    }
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

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
