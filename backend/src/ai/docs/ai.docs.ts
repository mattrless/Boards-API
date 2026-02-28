import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseDescriptionDto } from '../dto/response-description.dto';

export function ApiGenerateDescriptionDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate a short description from a title' }),
    ApiOkResponse({
      description: 'Description generated successfully.',
      type: ResponseDescriptionDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiCheckGrammarDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Check and correct text grammar' }),
    ApiOkResponse({
      description: 'Grammar checked successfully.',
      type: ResponseDescriptionDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiBearerAuth('JWT'),
  );
}
