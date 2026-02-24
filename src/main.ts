import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Boards API')
    .setDescription('API to consolidate NestJS knowledge.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Requires JWT token',
        in: 'header',
      },
      'JWT',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('rest-docs', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Boards Realtime API')
    .setDescription('WebSocket events for boards, lists, and cards.')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('boards-ws', {
      url: 'ws://localhost:3000',
      protocol: 'socket.io',
    })
    .build();

  const asyncApiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('ws-docs', app, asyncApiDocument);

  app.use(helmet());
  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
