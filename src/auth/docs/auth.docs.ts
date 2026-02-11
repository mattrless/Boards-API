import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from '../dto/response-login.dto';

export function ApiLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Login with credentials.' }),
    ApiResponse({
      status: 200,
      description: 'Login succeeded.',
      type: LoginResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}
