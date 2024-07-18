import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDTO {
  @IsEmail()
  @ApiProperty({ example: 'jhondoe@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'somepass' })
  password: string;
}
