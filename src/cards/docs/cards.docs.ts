import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CardResponseDto } from '../dto/card-response.dto';

export function ApiCreateCardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new card in a list' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'listId',
      type: Number,
      description: 'Target list id.',
    }),
    ApiOkResponse({
      description: 'Card created successfully.',
      type: CardResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board or list not found.' }),
    ApiBearerAuth('JWT'),
  );
}
