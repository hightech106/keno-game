import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { AuthService, LoginDto } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Operator login endpoint
   * POST /auth/login
   * 
   * In production, this would verify API keys or credentials
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operator login - Get JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        operatorId: { type: 'string', example: 'op-1' },
        apiKey: { type: 'string', example: 'optional-api-key' },
      },
      required: ['operatorId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
