import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CardResponseDto } from '../dto/card-response.dto';
import { CardSummaryResponseDto } from '../dto/card-summary-response.dto';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';

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

export function ApiUpdateCardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a card' }),
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
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiOkResponse({
      description: 'Card updated successfully.',
      type: CardResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board, list, or card not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindAllCardsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all cards from a list' }),
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
      description: 'List cards returned successfully.',
      type: [CardSummaryResponseDto],
    }),
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

export function ApiFindOneCardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get one card from a list' }),
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
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiOkResponse({
      description: 'Card returned successfully.',
      type: CardResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board, list, or card not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRemoveCardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a card' }),
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
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiOkResponse({
      description: 'Card deleted successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board, list, or card not found.' }),
    ApiBearerAuth('JWT'),
  );
}
