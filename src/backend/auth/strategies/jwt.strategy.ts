import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { OperatorService } from '../../operator/services/operator.service';

export interface JwtPayload {
  operatorId: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly operatorService: OperatorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    const { operatorId } = payload;

    if (!operatorId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verify operator exists and is active
    try {
      const operator = await this.operatorService.getOperator(operatorId);
      
      if (operator.status !== 'active') {
        throw new UnauthorizedException('Operator is not active');
      }

      return {
        operatorId: operator.operatorId,
        operator,
      };
    } catch (error) {
      throw new UnauthorizedException('Operator not found or inactive');
    }
  }
}
