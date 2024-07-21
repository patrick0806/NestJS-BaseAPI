import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('################');
    const user = username === 'admin' && password === 'admin';
    if (!user) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Invalid credentials, check your email and password',
      });
    }
    return user;
  }
}
