# Продукт

Источник: `README.md`, код `apps/web` и `apps/backend`, `docs/`. Ниже — выжимка, актуальная на момент переноса правил.

## Что делаем

Сайт и платформа VIRaTeC — международной научно-образовательной сети на базе факультета информационных технологий (ФИТ) КНУ имени Тараса Шевченко при участии Учебно-научного института филологии (ННИФ). Аудитория — исследователи, преподаватели, студенты и международные партнёры.

Две части:

- **Публичный сайт** — об инициативе, направления исследований, проекты, публикации, люди, возможности, контакты, юридические страницы. Страницы пререндерятся при сборке, тексты маркетинговых страниц приходят из Contentful.
- **Платформа для участников** — регистрация и вход (email + пароль, Google), 2FA, сессии, профиль и приватность, аватар, экспорт данных и удаление аккаунта, сохранённые публикации и проекты, сообщество (посты, лайки), админка для сотрудников.

Интерфейс двуязычный: `en` (по умолчанию) и `uk` (`apps/web/src/shared/i18n`). Пререндер идёт на украинском.

## Страницы

Маршруты — `apps/web/src/shared/config/routes.ts` (`ROUTES`), конфиг роутера — `apps/web/src/app/providers/router.tsx`. Ссылки с параметрами строятся хелперами оттуда же (`buildProjectPath`, `buildPublicationPath`, `buildPersonPath`, `buildAccountPath`) — не собирай URL строкой вручную.

| Маршрут                                                                  | Страница (`pages/…`)                                                        |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `/`                                                                      | `home`                                                                      |
| `/about`, `/about/viratec`, `/about/global-collaboration-framework`      | `about-initiative`, `viratec`, `global-collaboration`                       |
| `/research/areas`, `/research/projects`, `/research/projects/:projectId` | `research-areas`, `projects`, `project-detail`                              |
| `/research/experiential-learning`, `/research/student-research`          | `experiential-learning`, `student-research`                                 |
| `/publications`, `/publications/:slug`                                   | `publications`, `publication-detail`                                        |
| `/people`, `/people/:userId`                                             | `people`, `person`                                                          |
| `/opportunities`, `/contact`                                             | `opportunities`, `contact`                                                  |
| `/terms`, `/privacy`, `/cookies`, `/community-guidelines`                | `legal`                                                                     |
| `/login`, `/register`, `/forgot-password`                                | `login`, `register`, `forgot-password` (гостевые маршруты, `GuestRoute`)    |
| `/account`                                                               | `account` (защищённый, `ProtectedRoute`; раздел — query-параметр `section`) |
| `/admin`, `/admin/users`, `/admin/audit`                                 | `admin` (`ProtectedRoute`; права сотрудника проверяет API — `StaffGuard`)   |
| `*`                                                                      | `not-found`                                                                 |

## Модель данных

Схема — `apps/backend/prisma/schema.prisma`, миграции — `apps/backend/prisma/migrations`. Enum'ы Prisma продублированы в `packages/contracts/src/enums.ts` — это контракт с фронтом (там же есть enum'ы только для API, например `OpenToOption`, `LanguageLevel`).

| Модель                                       | Что хранит                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`                                       | аккаунт: роль (`UserRole`), роль сотрудника (`StaffRole`) и права (`AdminPermission`), факультет, уровень обучения, видимость профиля (`ProfileVisibility`), Google-привязка, 2FA |
| `UserAvatar`                                 | аватар пользователя (бинарные данные + MIME)                                                                                                                                      |
| `RefreshToken`, `BackupCode`, `MfaChallenge` | сессии, резервные коды и вызовы 2FA                                                                                                                                               |
| `AuditLog`, `RateLimitBucket`                | аудит действий и rate limit, оба в Postgres                                                                                                                                       |
| `SavedItem`                                  | сохранённое пользователем: `PUBLICATION` или `PROJECT` по `refId`                                                                                                                 |
| `ResearchPaper`                              | научные работы                                                                                                                                                                    |
| `Project`                                    | проекты (статус `ProjectStatus`, факультеты, теги, ссылки, `translations` в JSON)                                                                                                 |
| `Event`                                      | события (`EventType`, даты, место, онлайн)                                                                                                                                        |
| `Publication`                                | публикации и новости по `slug`, контент в JSON                                                                                                                                    |
| `CommunityPost`, `PostLike`                  | посты сообщества и лайки (уникальный лайк на пользователя)                                                                                                                        |

## Откуда берётся контент

- **Contentful** — тексты страниц, партнёры, команда, таймлайн, галерея, возможности, юридические документы, SEO и настройки сайта. Подтягиваются при сборке (`content:pull`) в типизированные модули, закоммиченные в репозиторий, после загрузки страницы освежаются через `GET /api/v1/content/entries`. Подробно — `docs/deployment/contentful.md` и [frontend/overview.md](frontend/overview.md).
- **База данных** — проекты, публикации, события, пользователи, сообщество. Это не Contentful и туда не переносится.

## Открытые вопросы

- `README.md` и `CONTRIBUTING.md` упоминают Redis, MinIO и Kubernetes — в коде бэкенда Redis только объявлен в конфиге (`redis.url`), MinIO и k8s не используются. Не опирайся на них, пока задача явно этого не требует.
- `packages/ui` пока пустой — UI-кит живёт в `apps/web/src/shared/ui`. Переносить его в пакет без явной задачи не нужно.
