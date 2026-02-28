import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { BoardMemberResponseDto } from '../dto/board-members-response.dto';

export function ApiAddMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Add member to board.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiOkResponse({
      description: 'Member added successfully',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 404, description: 'Board or user not found.' }),
    ApiResponse({
      status: 409,
      description: 'User is already a member of this board.',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: user is not a board member or lacks permission.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRemoveMemberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove member from board.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'targetUserId',
      type: Number,
      description: 'User id to remove from board.',
    }),
    ApiOkResponse({
      description: 'Member removed successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 404, description: 'Board or member not found.' }),
    ApiResponse({
      status: 409,
      description:
        'Business rule conflict: owner self-removal or admin removing owner/admin.',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiUpdateMemberRoleDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update board member role.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiParam({
      name: 'targetUserId',
      type: Number,
      description: 'User id whose role will be updated.',
    }),
    ApiOkResponse({
      description: 'Member role updated successfully.',
      type: ActionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 404, description: 'Board or member not found.' }),
    ApiResponse({
      status: 409,
      description:
        'Business rule conflict: owner role change, no-op role update, or admin policy violation.',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindBoardMembersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get board members with their board role.' }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'Target board id.',
    }),
    ApiOkResponse({
      description: 'Board members returned successfully.',
      type: [BoardMemberResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 404, description: 'Board not found.' }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: current user is not a board member or lacks permission.',
    }),
    ApiBearerAuth('JWT'),
  );
}
