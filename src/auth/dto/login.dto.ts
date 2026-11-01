import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'user@example.com',
    required: true,
    format: 'email',
  })
  @IsString({ message: 'Почта должна быть строкой' })
  @IsNotEmpty({ message: 'Почта обязательна для заполнения' })
  @IsEmail({}, { message: 'Некорректный формат почты' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123',
    required: true,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;
}
