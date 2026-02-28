import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ResponseDescriptionDto } from '../dto/response-description.dto';

type GeminiResponse = { text?: string | null };
type GeminiClient = {
  models: {
    generateContent(input: {
      model: string;
      contents: string;
    }): Promise<GeminiResponse>;
  };
};

@Injectable()
export class GeminiService {
  private readonly aiClientPromise: Promise<GeminiClient>;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.getOrThrow<string>('GEMINI_MODEL');
    this.aiClientPromise = this.createAiClient();
  }

  private async createAiClient(): Promise<GeminiClient> {
    const { GoogleGenAI } = await import('@google/genai');

    return new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async generateDescription(title: string): Promise<ResponseDescriptionDto> {
    let response: GeminiResponse;
    const ai = await this.aiClientPromise;

    try {
      response = await ai.models.generateContent({
        model: this.model,
        contents: `Eres un generador de descripciones de tareas.
          Genera exactamente una sola descripción breve para el siguiente título.
          Reglas obligatorias:
          - Responde solo con texto plano.
          - No uses listas, opciones, encabezados, markdown, comillas.
          - No agregues frases como "aquí tienes" o similares.
          - Mantén el mismo idioma del texto original.
          - Agrega recomendaciones para posibles casos a los que se refiera el título.

          Título: ${title}`,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate description with Gemini.',
      );
    }

    const generatedText = response.text?.trim();
    if (!generatedText) {
      throw new InternalServerErrorException(
        'Gemini did not return generated text.',
      );
    }

    return plainToInstance(
      ResponseDescriptionDto,
      {
        description: generatedText,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async checkGrammar(description: string): Promise<ResponseDescriptionDto> {
    let response: GeminiResponse;
    const ai = await this.aiClientPromise;

    try {
      response = await ai.models.generateContent({
        model: this.model,
        contents: `Corrige la gramática y ortografía del siguiente texto sin cambiar su intención.
          Reglas obligatorias:
          - Responde solo con el texto corregido.
          - No agregues explicaciones, encabezados, opciones, markdown ni comillas.
          - Mantén el mismo idioma del texto original.          

          Texto: ${description}`,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to check grammar with Gemini.',
      );
    }

    const correctedText = response.text?.trim();
    if (!correctedText) {
      throw new InternalServerErrorException(
        'Gemini did not return corrected text.',
      );
    }

    return plainToInstance(
      ResponseDescriptionDto,
      {
        description: correctedText,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
