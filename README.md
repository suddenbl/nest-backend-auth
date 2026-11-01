# NestJS Backend API

REST API сервис на базе **NestJS**, **Prisma ORM** и **PostgreSQL**, реализующий полноценную систему аутентификации (JWT + Refresh Cookies), стандартизацию ответов и ошибок, документирование через Swagger (OpenAPI) и готовые тесты коллекции в Bruno.

---

## Стек технологий

- **Фреймворк:** [NestJS](https://nestjs.com/) (Express, TypeScript ESM)
- **База данных:** [PostgreSQL 16](https://www.postgresql.org/) (Docker Compose)
- **ORM:** [Prisma 7](https://www.prisma.io/) (с драйвером `@prisma/adapter-pg`)
- **Аутентификация & Безопасность:**
  - [Passport.js](http://www.passportjs.org/) + `passport-jwt`
  - `@nestjs/jwt` (Access Token)
  - Хеширование паролей: [argon2](https://github.com/ranisalt/node-argon2)
  - Сессионные куки: `cookie-parser` (HttpOnly Refresh Token)
- **Валидация:** `class-validator`, `class-transformer`
- **Документация:** `@nestjs/swagger` + Swagger UI
- **Линтинг и тестирование:** [oxlint](https://oxc.rs/), [Vitest](https://vitest.dev/)
- **API Клиент:** [Bruno](https://www.usebruno.com/) (коллекция хранится прямо в репозитории)

---

## Архитектура и ключевые особенности

1. **Аутентификация по Best Practices:**
   - **Access Token:** короткоживущий JWT-токен, передается в заголовке `Authorization: Bearer <token>`.
   - **Refresh Token:** долгоживущий JWT-токен, передается в безопасной `HttpOnly` Cookie (защита от XSS-атак).
   - Эндпоинт `/auth/me` для проверки текущей сессии с кастомным декоратором `@Authorized()`.

2. **Стандартизация API:**
   - **Успешные ответы:** перехватываются глобальным `ResponseInterceptor` и оборачиваются в:
     ```json
     {
       "data": { ... },
       "error": false,
       "code": 200
     }
     ```
   - **Ошибки и валидация:** перехватываются глобальным фильтром `AllExceptionsFilter` и форматируются в строгий контракт:
     ```json
     {
       "message": "Описание ошибки или список ошибок валидации",
       "error": true,
       "code": 400
     }
     ```

3. **Чистый Swagger (OpenAPI):**
   - Документация не загромождает контроллеры благодаря композитным декораторам в `auth.swagger.ts`.
   - Поддерживает тестирование как с Bearer токеном, так и с cookie.

4. **Интеграция с Bruno:**
   - Все запросы для тестирования CRUD/Auth сохранены в папке `bruno/` и готовы к запуску сразу после клонирования репозитория.

---

## Структура проекта

```text
nest-try/
├── .agents/                    # Инструкции и навыки агентов
├── bruno/                      # Коллекция API запросов для Bruno
│   └── NestJS API/
│       ├── auth/               # Запросы авторизации (register, login, me, refresh, logout)
│       └── environments/       # Переменные окружения (baseUrl и др.)
├── prisma/
│   └── schema.prisma           # Схема базы данных PostgreSQL
├── src/
│   ├── auth/                   # Модуль аутентификации
│   │   ├── decorators/         # Декораторы (@Authorized, @Authorization)
│   │   ├── dto/                # DTO с валидацией и Swagger-схемами
│   │   ├── guards/             # JWT Guards
│   │   ├── interfaces/         # Интерфейсы токенов
│   │   ├── strategies/         # Passport JWT стратегия
│   │   ├── auth.controller.ts  # Маршруты аутентификации
│   │   ├── auth.service.ts     # Бизнес-логика (хеширование, выдача токенов)
│   │   └── auth.swagger.ts     # Документация Swagger (applyDecorators)
│   ├── common/
│   │   ├── filters/            # Глобальный фильтр ошибок AllExceptionsFilter
│   │   └── interceptors/       # Глобальный интерцептор успешных ответов
│   ├── config/                 # Конфигурация JWT и Swagger
│   ├── prisma/                 # Сервис подключения к БД
│   ├── utils/                  # Вспомогательные утилиты
│   ├── app.module.ts           # Корневой модуль приложения
│   └── main.ts                 # Точка входа (pipes, filters, interceptors, swagger)
├── docker-compose.yml          # Запуск контейнера PostgreSQL
├── package.json
└── tsconfig.json
```

---

## Пошаговая инструкция по запуску

### 1. Требования к окружению

- [Node.js](https://nodejs.org/) (v20+ или v22+) или [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) и Docker Compose (для запуска PostgreSQL)
- [Git](https://git-scm.com/)

---

### 2. Клонирование и установка зависимостей

```bash
git clone https://github.com/suddenbl/nest-backend-auth.git
cd nest-backend-auth

# Установка зависимостей (через bun или npm):
bun install
# или
npm install
```

---

### 3. Настройка переменных окружения

Скопируйте пример файла конфигурации:

```bash
cp .env.example .env
```

При необходимости отредактируйте параметры в `.env`:

```env
NODE_ENV=development

COOKIE_DOMAIN=localhost

JWT_SECRET=super_secret_jwt_key_change_me
JWT_ACCESS_TOKEN_TTL=2h
JWT_REFRESH_TOKEN_TTL=7d

POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DATABASE=nest_backend_auth
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
DATABASE_URL=postgresql://root:root@localhost:5433/nest_try?schema=public
```

---

### 4. Запуск базы данных

Запустите PostgreSQL в фоновом режиме через Docker Compose:

```bash
docker compose up -d
```

Примените схему Prisma к базе данных:

```bash
npx prisma db push
```

_(Опционально)_ Сгенерировать Prisma Client, если еще не был сгенерирован:

```bash
npx prisma generate
```

---

### 5. Запуск приложения

```bash
# Режим разработки с hot-reload:
bun run start:dev
# или
npm run start:dev

# Сборка проекта:
bun run build # (или npm run build)

# Запуск собранного проекта:
bun run start:prod
```

После старта сервер доступен по адресу: **`http://localhost:3000`**

---

## Документация API (Swagger UI)

Интерактивная документация OpenAPI доступна сразу после запуска приложения:

- **[http://localhost:3000/api](http://localhost:3000/api)**

Спецификация в форматах JSON и YAML:

- `http://localhost:3000/swagger.json`
- `http://localhost:3000/swagger.yaml`

---

## Тестирование API через Bruno

В проект уже встроена готовая коллекция для [Bruno](https://www.usebruno.com/):

1. Установите и откройте приложение **Bruno**.
2. Нажмите **Open Collection**.
3. Выберите папку `bruno/NestJS API` в корне проекта.
4. В верхнем правом углу переключите Environment на **`local`**.
5. Готово! Вам доступны запросы:
   - `POST /auth/register` — регистрация нового пользователя
   - `POST /auth/login` — вход и установка refresh cookie
   - `GET /auth/me` — получение данных текущего пользователя (требует Bearer токен)
   - `GET /auth/refresh` — ротация access-токена по cookie
   - `GET /auth/logout` — выход и очистка сессионных кук

Запуск тестов коллекции через консоль:

```bash
npx @usebruno/cli run "bruno/NestJS API" --env local
```

---

## Полезные команды

| Команда                             | Описание                                                  |
| :---------------------------------- | :-------------------------------------------------------- |
| `npm run lint` / `bun run lint`     | Быстрая проверка кода линтером `oxlint`                   |
| `npm run format` / `bun run format` | Форматирование исходного кода Prettier                    |
| `npm run test` / `bun run test`     | Запуск unit-тестов с помощью Vitest                       |
| `npm run test:e2e`                  | Запуск e2e-тестов                                         |
| `npx prisma studio`                 | Веб-интерфейс для просмотра и редактирования записей в БД |
