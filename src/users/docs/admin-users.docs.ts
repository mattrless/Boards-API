import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ActionResponseDto } from '../dto/action-response.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApiAdminUpdateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update any user (Admin only)' }),
    ApiOkResponse({
      description: 'The user has been successfully updated.',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiAdminRemoveUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete any user (Admin only)' }),
    ApiOkResponse({
      description: 'The user has been successfully deleted.',
      type: ActionResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiAdminRestoreUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Restore a soft-deleted user' }),
    ApiOkResponse({
      description: 'The user has been successfully restored.',
      type: ActionResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiResponse({ status: 404, description: 'User not found or not deleted.' }),
    ApiBearerAuth('JWT'),
  );
}
