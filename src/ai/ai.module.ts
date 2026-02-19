import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { AiController } from './ai.controller';

@Module({
  providers: [GeminiService],
  controllers: [AiController],
})
export class AiModule {}
