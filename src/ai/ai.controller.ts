import { ApiTags } from '@nestjs/swagger';
import { GeminiService } from './services/gemini.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { CheckGrammarDto } from './dto/check-grammar.dto';
import {
  ApiCheckGrammarDocs,
  ApiGenerateDescriptionDocs,
} from './docs/ai.docs';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  @ApiGenerateDescriptionDocs()
  @UseGuards(AuthGuard('jwt'))
  @Post('generate-description')
  generateDescription(@Body() generateDescriptionDto: GenerateDescriptionDto) {
    return this.geminiService.generateDescription(generateDescriptionDto.title);
  }

  @ApiCheckGrammarDocs()
  @UseGuards(AuthGuard('jwt'))
  @Post('check-grammar')
  checkGrammar(@Body() checkGrammarDto: CheckGrammarDto) {
    return this.geminiService.checkGrammar(checkGrammarDto.description);
  }
}
