# VIRaTeC — Virtual Innovating Research & Technology Community

[![CI/CD Pipeline](https://github.com/viratec-knu/viratec/actions/workflows/ci.yml/badge.svg)](https://github.com/viratec-knu/viratec/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-ef4444.svg)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/package__manager-pnpm-orange.svg)](https://pnpm.io/)
[![Oxlint](https://img.shields.io/badge/linter-Oxlint-blue.svg)](https://oxc.rs/)

> **VIRaTeC (Virtual Innovating Research & Technology Community)** у Київському національному університеті імені Тараса Шевченка — це міжнародна освітня та наукова мережа, створена на базі **Факультету інформаційних технологій (ФІТ)** та за активної участі інших підрозділів (зокрема **Навчально-наукового інституту філології - ННІФ**) КНУ.

---

## 🌟 Про платформу

Платформа VIRaTeC об'єднує дослідників, викладачів, студентів, технологічні лабораторії та міжнародних партнерів для спільної роботи над науково-дослідними та інноваційними проектами, міждисциплінарними дослідженнями (штучний інтелект, комп'ютерна лінгвістика, цифрова гуманітаристика, кібербезпека, хмарні обчислення тощо).

### Основні можливості

- 🔬 **Каталог досліджень та інноваційних проєктів**: публікації, репозиторії досліджень, спільні розробки між підрозділами.
- 🎓 **Міждисциплінарна співпраця**: синергія між ФІТ (IT-технології, ШІ) та ННІФ (комп'ютерна лінгвістика, NLP, перекладознавство) та іншими інститутами КНУ.
- 📅 **Події та заходи**: хакатони, воркшопи, наукові семінари, міжнародні конференції.
- 💬 **Спільнота та обговорення**: наукові форуми, обмін досвідом, пошук наукових керівників та менторів.
- 🏢 **Партнерства**: інтеграція з міжнародними університетами та IT-компаніями.

---

## 🏗️ Архітектура проєкту

Репозиторій організований як сучасний **Turborepo** монорепозиторій під керуванням **pnpm workspaces**:

```
Viratec/
├── apps/
│   ├── backend/             # Модульний бекенд на NestJS (Fastify, Prisma, PostgreSQL, Redis)
│   └── web/                 # Фронтенд на React 19 + Vite (Feature-Sliced Design - FSD)
├── packages/
│   ├── contracts/           # Спільні TypeScript контракти, DTO та Zod схеми
│   ├── ui/                  # Спільна бібліотека UI-примітивів
│   ├── utils/               # Загальні утиліти та хелпери
│   └── tsconfig/            # Спільні конфігурації TypeScript
├── infrastructure/          # Docker, Kubernetes маніфести, Terraform, моніторинг
├── scripts/                 # Автоматизаційні скрипти для CI, DB та утиліт
└── docs/                    # Архітектурна та технічна документація
```

### ⚙️ Стек технологій

- **Монорепо**: [Turborepo](https://turbo.build/), [pnpm Workspaces](https://pnpm.io/)
- **Бекенд**: [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), [PostgreSQL 16](https://www.postgresql.org/), [Redis 7](https://redis.io/), [MinIO S3](https://min.io/)
- **Фронтенд**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query)
- **Архітектурні патерни**:
  - Бекенд: **Modular Architecture** (Domain-driven modules: Auth, Users, Research, Projects, Events, Community)
  - Фронтенд: **Feature-Sliced Design (FSD)** (app, pages, widgets, features, entities, shared)
- **Якість коду & Лінтери**: [Oxlint](https://oxc.rs/), [Prettier](https://prettier.io/), [Commitlint](https://commitlint.js.org/), [Husky](https://typicode.github.io/husky/), [Lint-Staged](https://github.com/lint-staged/lint-staged), [Knip](https://knip.dev/)
- **Контейнеризація**: Docker, Multi-stage Dockerfiles, Docker Compose (Dev/Prod)
- **CI/CD**: GitHub Actions (Lint, Typecheck, Build, Knip, Docker, Lighthouse)

---

## 🚀 Швидкий старт для розробників

### 1. Передумови

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 10.0.0` (рекомендовано `10.5.2`):
  ```bash
  corepack enable
  corepack prepare pnpm@10.5.2 --activate
  ```
- **Docker & Docker Compose**

### 2. Встановлення та налаштування оточення

1. Клонуйте репозиторій:

   ```bash
   git clone https://github.com/viratec-knu/viratec.git
   cd viratec
   ```

2. Скопіюйте файл змінних середовища:

   ```bash
   cp .env.example .env
   ```

3. Встановіть залежності (без npm, суворо через pnpm):

   ```bash
   pnpm install
   ```

4. Запустіть необхідні локальні сервіси (PostgreSQL, Redis, MinIO):

   ```bash
   pnpm docker:dev:up
   ```

5. Згенеруйте клієнт бази даних:
   ```bash
   pnpm --filter @viratec/backend db:generate
   ```

### 3. Запуск у режимі розробки

Запуск усіх додатків одночасно через Turborepo:

```bash
pnpm dev
```

Або запуск окремих додатків:

```bash
pnpm dev:backend   # NestJS API (http://localhost:3000, Swagger: http://localhost:3000/docs)
pnpm dev:web       # React 19 Frontend (http://localhost:5173)
```

---

## 📋 Доступні команди

| Команда                | Опис                                                       |
| :--------------------- | :--------------------------------------------------------- |
| `pnpm dev`             | Запуск усіх додатків у режимі розробки з HMR               |
| `pnpm build`           | Збірка всіх пакетів і додатків через Turborepo             |
| `pnpm lint`            | Швидка перевірка коду через Oxlint                         |
| `pnpm lint:fix`        | Автоматичне виправлення лінтингу                           |
| `pnpm format`          | Форматування коду через Prettier                           |
| `pnpm format:check`    | Перевірка форматування коду                                |
| `pnpm typecheck`       | Перевірка типів TypeScript по всьому монорепозиторію       |
| `pnpm knip`            | Аналіз невикористовуваного коду та залежностей             |
| `pnpm validate`        | Комплексна перевірка коду (EOL, Env, Types, Lint, Knip)    |
| `pnpm docker:dev:up`   | Підняття локальної інфраструктури (Postgres, Redis, MinIO) |
| `pnpm docker:dev:down` | Зупинка локальної інфраструктури                           |
| `pnpm docker:prod:up`  | Повний запуск продакшн стеку в контейнерах                 |
| `pnpm clean`           | Очищення build-артефактів, кешів та тимчасових директорій  |

---

## 🤝 Внесок у проєкт

Будь ласка, ознайомтеся з [CONTRIBUTING.md](./CONTRIBUTING.md) для деталей щодо робочого процесу, створення гілок, конвенцій комітів та стандартів розробки.

## 📜 Ліцензія

Проєкт розповсюджується під ліцензією [MIT](./LICENSE).
VIRaTeC © 2026, Київський національний університет імені Тараса Шевченка.
