import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { CardMemberResponseDto } from '../dto/card-members-response.dto';

export function ApiAddCardMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Add member to card.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiOkResponse({
      description: 'Member added to card successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: members can only add themselves; board admin or system admin can add any board member.',
    }),
    ApiResponse({
      status: 404,
      description: 'Board, card, or user not found.',
    }),
    ApiResponse({
      status: 409,
      description: 'User is already assigned to this card.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRemoveCardMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove member from card.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiParam({
      name: 'targetUserId',
      type: Number,
      description: 'Target user id to remove from card.',
    }),
    ApiOkResponse({
      description: 'Member removed from card successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: members can only remove themselves; board admin or system admin can remove anyone from the card.',
    }),
    ApiResponse({
      status: 404,
      description: 'Board, card, or assignment not found.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindCardMembersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get card members.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'cardId',
      type: Number,
      description: 'Target card id.',
    }),
    ApiOkResponse({
      description: 'Card members returned successfully.',
      type: [CardMemberResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Board or card not found.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiBearerAuth('JWT'),
  );
}
