# Git Flow та конвенції комітів

## Гілки

- `main` — стабільний релізний код.
- `develop` — основна гілка розробки.
- Робочі гілки: `feat/*`, `fix/*`, `refactor/*`, `infra/*`, `docs/*`.

## Формат повідомлень комітів

```
<type>(<scope>): <subject>
```

Наприклад:
`feat(research): implement multi-faculty tagging for publications`
`fix(auth): prevent duplicate token rotation on concurrent requests`

Коміти валідуються автоматично через `@commitlint/cli` та `husky`.
