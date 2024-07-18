import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginService {
  async execute(): Promise<any> {
    return 'Hello World';
  }
}
