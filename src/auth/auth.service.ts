import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { verify, hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterRequest } from './dto/register.dto.js';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt.interface.js';
import { LoginRequest } from './dto/login.dto.js';
import { isDev } from '../utils/is-dev.util.js';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: StringValue;
  private readonly JWT_REFRESH_TOKEN_TTL: StringValue;

  private readonly cookieDomain: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    this.cookieDomain = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  public async register(res: Response, dto: RegisterRequest) {
    const { email, name, password } = dto;

    const exUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (exUser) {
      throw new ConflictException('Пользователь уже существует!');
    }

    const newUser = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: await hash(password),
      },
    });

    return this.auth(res, newUser.id);
  }

  public async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const exUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!exUser) {
      throw new NotFoundException('Пользователь не найден!');
    }

    const isValidPassword = await verify(exUser.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('Пользователь не найден!');
    }

    return this.auth(res, exUser.id);
  }

  public async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Пользователь не авторизован!');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new NotFoundException();
      }

      return this.auth(res, user.id);
    }
  }

  public async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));
    return {
      message: 'Вы вышли из системы!',
    };
  }

  public async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден!');

    return user;
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.cookieDomain,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}
