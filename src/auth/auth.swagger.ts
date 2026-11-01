import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function AuthRegisterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация нового пользователя' }),
    ApiCreatedResponse({ description: 'Пользователь успешно зарегистрирован' }),
    ApiBadRequestResponse({ description: 'Ошибка валидации входящих данных' }),
    ApiConflictResponse({
      description: 'Пользователь с таким email уже существует',
    }),
  );
}

export function AuthLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Авторизация пользователя' }),
    ApiOkResponse({ description: 'Успешная авторизация' }),
    ApiBadRequestResponse({ description: 'Ошибка валидации входящих данных' }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден или неверный пароль',
    }),
  );
}

export function AuthMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение профиля текущего пользователя' }),
    ApiBearerAuth(),
    ApiOkResponse({ description: 'Данные пользователя успешно получены' }),
    ApiUnauthorizedResponse({
      description: 'Не авторизован (отсутствует или невалиден Bearer токен)',
    }),
  );
}

export function AuthRefreshDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление access токена' }),
    ApiCookieAuth('refreshToken'),
    ApiOkResponse({ description: 'Access токен успешно обновлен' }),
    ApiUnauthorizedResponse({
      description: 'Не авторизован (отсутствует или истек refresh токен)',
    }),
    ApiNotFoundResponse({ description: 'Пользователь не найден' }),
  );
}

export function AuthLogoutDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Выход из системы' }),
    ApiOkResponse({ description: 'Успешный выход из системы' }),
  );
}
