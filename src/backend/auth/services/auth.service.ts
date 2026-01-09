import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OperatorService } from '../../operator/services/operator.service';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface LoginDto {
  operatorId: string;
  apiKey?: string; // For B2B, operators might use API keys
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  operatorId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly operatorService: OperatorService,
  ) {}

  /**
   * Authenticate operator and generate JWT token
   * In production, this would verify API keys, passwords, etc.
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { operatorId, apiKey } = loginDto;

    // Verify operator exists
    const operator = await this.operatorService.getOperator(operatorId);
    
    if (operator.status !== 'active') {
      throw new UnauthorizedException('Operator is not active');
    }

    // In production, verify API key here
    // For now, we'll allow any operatorId (development mode)
    if (apiKey) {
      // TODO: Verify API key against stored credentials
      // const isValid = await this.verifyApiKey(operatorId, apiKey);
      // if (!isValid) {
      //   throw new UnauthorizedException('Invalid API key');
      // }
    }

    // Generate JWT token
    const payload: JwtPayload = {
      operatorId: operator.operatorId,
      sub: operator.operatorId,
    };

    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN') || 3600; // 1 hour default

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: `${expiresIn}s`,
      }),
      token_type: 'Bearer',
      expires_in: expiresIn,
      operatorId: operator.operatorId,
    };
  }

  /**
   * Verify token and return operator info
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
