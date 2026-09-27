# Посібник з Docker та розгортання

У проєкті налаштовано два конфігураційні файли Docker Compose для різних сценаріїв:

## 1. Локальна розробка (`docker-compose.dev.yml`)

Містить лише допоміжні сервіси, а сервери додатків запускаються на хост-машині з миттєвим HMR:

- **PostgreSQL 16**: `localhost:5432`
- **Redis 7**: `localhost:6379`
- **MinIO S3**: `http://localhost:9000` (Консоль: `http://localhost:9001`)

Команди:

```bash
pnpm docker:dev:up    # Запуск
pnpm docker:dev:down  # Зупинка
pnpm docker:dev:logs  # Перегляд логів
```

## 2. Продакшн стек (`docker-compose.prod.yml`)

Повноцінна автономна екосистема з оркестрацією:

- Оптимізовані контейнери Node.js 22 та Nginx Alpine.
- Healthchecks та автоматичний перезапуск.
- Профіль моніторингу: `--profile monitoring` для запуску Prometheus та Grafana.
