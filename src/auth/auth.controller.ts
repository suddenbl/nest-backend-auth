import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterRequest } from './dto/register.dto.js';
import { LoginRequest } from './dto/login.dto.js';
import type { Response, Request } from 'express';
import {
  AuthLoginDocs,
  AuthLogoutDocs,
  AuthMeDocs,
  AuthRefreshDocs,
  AuthRegisterDocs,
} from './auth.swagger.js';
import { Authorization } from './decorators/authorization.decorator.js';
import { Authorized } from './decorators/authorized.decorator.js';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthRegisterDocs()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  public async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequest,
  ) {
    return this.authService.register(res, dto);
  }

  @AuthLoginDocs()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequest,
  ) {
    return this.authService.login(res, dto);
  }

  @Authorization()
  @AuthMeDocs()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public async getMe(@Authorized() user: User) {
    return user;
  }

  @AuthRefreshDocs()
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @AuthLogoutDocs()
  @Get('logout')
  public async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
