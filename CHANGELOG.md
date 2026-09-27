# Журнал змін (Changelog)

Усі помітні зміни у платформі **VIRaTeC** документуватимуться в цьому файлі.

Формат базується на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
та відповідає [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-27

### Додано

- 🚀 **Ініціалізація монорепозиторію**:
  - Налаштування `Turborepo` та `pnpm workspaces` (apps, packages).
  - Інтеграція `Oxlint` та `Prettier` для високопродуктивного лінтингу та форматування.
  - Впровадження Git-хуків (`husky`, `lint-staged`) та валідації комітів (`commitlint`).
  - Налаштування `knip` для аудиту невикористовуваного коду та залежностей.
- 🏛️ **Бекенд (apps/backend)**:
  - Модульна архітектура на NestJS (Fastify, Prisma ORM, PostgreSQL, Redis).
  - Доменні модулі: `auth`, `users`, `research`, `projects`, `events`, `community`, `health`, `config`, `common`.
  - Повна схема бази даних PostgreSQL у `schema.prisma`.
  - Swagger/OpenAPI специфікація ендпоінтів за маршрутом `/docs`.
  - Багатоетапний виробничий `Dockerfile` на базі Node 24 Alpine.
- 🎨 **Фронтенд (apps/web)**:
  - Архітектура Feature-Sliced Design (FSD) на базі React 19, TypeScript, Vite та Tailwind CSS.
  - Базові сторінки: Головна, Дослідження, Проєкти, Події, Спільнота, Профіль, Авторизація.
  - Виробничий `Dockerfile` з оптимізованим сервером Nginx та конфігурацією кешування SPA.
- 📦 **Спільні пакети (packages)**:
  - `packages/contracts`: спільні інтерфейси та контракти API.
  - `packages/ui`: спільна бібліотека компонентів інтерфейсу.
  - `packages/utils`: загальні хелпери та форматери.
  - `packages/tsconfig`: централізовані конфігурації TypeScript.
- 🐳 **Docker Orchestration**:
  - `docker-compose.dev.yml` для швидкого підняття PostgreSQL, Redis, MinIO (з автоматичним створенням бакетів).
  - `docker-compose.prod.yml` для повномасштабного розгортання разом з моніторингом (Prometheus, Grafana, Loki).
- ⚙️ **CI/CD**:
  - Робочі процеси GitHub Actions для лінтингу, тайпчекінгу, збірки, аудиту Knip, перевірки Dockerfiles та неблокуючого Lighthouse.
  - Семантичні шаблони PR та Issue.
- 📚 **Документація**:
  - Вичерпний README, Contributing українською мовою, Code of Conduct, Security, архітектурні гайди в `docs/`.
