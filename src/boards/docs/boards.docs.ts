import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { BoardResponseDto } from '../dto/board-response.dto';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { BoardDetailsResponseDto } from '../dto/board-details-response.dto';

export function ApiCreateBoardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create board' }),
    ApiOkResponse({
      description: 'The board has been successfully created.',
      type: BoardResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindAllBoardsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve all boards' }),
    ApiOkResponse({
      description: 'List of all boards returned successfully.',
      type: [BoardResponseDto],
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindOneBoardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific board by ID' }),
    ApiOkResponse({
      description: 'Board found and returned.',
      type: BoardDetailsResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiUpdateBoardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update board by id' }),
    ApiOkResponse({
      description: 'The board has been successfully updated.',
      type: BoardResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRemoveBoardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete board by id' }),
    ApiOkResponse({
      description: 'The board has been successfully deleted.',
      type: BoardResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRestoreBoardDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Restore board by id' }),
    ApiOkResponse({
      description: 'The board has been successfully restired.',
      type: BoardResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiTransferOwnershipDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer board ownership to another member.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'targetUserId',
      type: Number,
      description: 'User id that will become the new owner.',
    }),
    ApiOkResponse({
      description: 'Board ownership transferred successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: only the current owner can transfer ownership.',
    }),
    ApiResponse({
      status: 404,
      description: 'Board or target member not found.',
    }),
    ApiResponse({
      status: 409,
      description:
        'Conflict: target is already owner or has an unsupported board role.',
    }),
    ApiBearerAuth('JWT'),
  );
}
