import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApiCreateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiCreatedResponse({
      description: 'The user has been successfully created.',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
  );
}

export function ApiFindAllUsersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve all users' }),
    ApiOkResponse({
      description: 'List of all users returned successfully.',
      type: [UserResponseDto],
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Insufficient permissions.',
    }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiFindOneUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific user by ID' }),
    ApiOkResponse({
      description: 'User found and returned.',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiUpdateMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update the authenticated user profile' }),
    ApiOkResponse({
      description: 'Profile updated successfully.',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiBearerAuth('JWT'),
  );
}

export function ApiRemoveMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete the authenticated user account' }),
    ApiOkResponse({ description: 'Account deleted successfully.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({
      status: 409,
      description:
        'Conflict: user owns one or more boards and must transfer ownership first.',
    }),
    ApiBearerAuth('JWT'),
  );
}
