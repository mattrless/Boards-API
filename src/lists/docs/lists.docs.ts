import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ListResponseDto } from '../dto/list-response.dto';
import { ListSummaryResponseDto } from '../dto/list-summary-response.dto';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';

export function ApiCreateListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new list in a board' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiOkResponse({
      description: 'List created successfully.',
      type: ListResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiListsByBoardIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all lists from a board' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiOkResponse({
      description: 'Board lists returned successfully.',
      type: [ListSummaryResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindOneListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get one list from a board' }),
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
      description: 'List returned successfully.',
      type: ListResponseDto,
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

export function ApiUpdateListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a list' }),
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
      description: 'List updated successfully.',
      type: ListResponseDto,
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

export function ApiUpdateListPositionDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Move a list to a new position' }),
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
      description: 'List position updated successfully.',
      type: ListResponseDto,
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

export function ApiRemoveListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a list' }),
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
      description: 'List deleted successfully.',
      type: ActionResponseDto,
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
