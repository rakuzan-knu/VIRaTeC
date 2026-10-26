# Feature-Sliced Design — правила для `apps/web`

FSD применяется внутри `apps/web/src`. `packages/contracts` и `packages/utils` — не ФСД-слои, это внешняя основа под всеми слоями (см. [overview.md](overview.md)). Краткая версия тех же правил для людей — `docs/architecture/frontend-fsd.md`.

## Слои, сверху вниз

```
app → pages → widgets → features → entities → shared
```

Правило одно и неизменное: **слой может импортировать только из слоёв строго ниже себя.** Не из соседних слайсов своего слоя, не сверху. `shared` не знает ни о чём, `entities` не знает про `features`/`widgets`/`pages`, и так далее. Линтер это не проверяет — проверяй сам перед каждым новым импортом. Слоя `processes` нет (устарел в FSD, не создавай).

- **`app`** — `App.tsx` (`QueryClientProvider`, `SessionProvider`), `providers/router.tsx` и обёртки маршрутов (`RootLayout`, `ProtectedRoute`, `GuestRoute`, `Redirect`), глобальные стили и токены (`app/styles/index.css`). Точки входа — `src/main.tsx` и `src/entry-server.tsx` (пререндер).
- **`pages`** — компоненты маршрутов: `home`, `projects`, `project-detail`, `publications`, `publication-detail`, `people`, `person`, `account`, `admin`, `login`, `register`, `legal` и т.д. Тонкие — собирают виджеты, фичи и сущности. Контент из Contentful живёт в `pages/*/model/page.generated.ts` (генерируется, не правится руками) и `model/content.ts`.
- **`widgets`** — самостоятельные композитные блоки: `site-header`, `site-footer`, `page-layout`, `page-intro`, `auth-layout`. Виджет не импортирует другой виджет: если обёртке нужен соседний виджет, он приходит слотом-пропсом из страницы (`<PageLayout footer={<SiteFooter />}>`, `<PageIntro header={<SiteHeader />}>`).
- **`features`** — конкретное пользовательское действие, у которого есть глагол: `login-by-email`, `login-by-google`, `register-by-email`, `logout`, `reset-password`, `verify-two-factor`, `manage-two-factor`, `manage-sessions`, `switch-account`, `change-password`, `update-profile`, `update-avatar`, `update-privacy`, `link-google`, `save-item`, `export-data`, `delete-account`. Одна фича — одно действие, не «раздел UI».
- **`entities`** — бизнес-сущности со своим отображением и запросами: `project`, `publication`, `person`, `partner`, `session` (Zustand-стор текущего пользователя и известных аккаунтов).
- **`shared`** — UI-кит (`shared/ui`, см. [design-system.md](../design-system.md)), HTTP-клиент (`shared/api/apiClient.ts`), конфиг (`shared/config`: `routes.ts`, `env.ts`, `navigation.ts`, `storageKeys.ts`, SEO), i18n (`shared/i18n`: `useLocale`, `useLocalized`, `defineMessages`, `useCommonMessages`, `pluralUk` и стор языка), хуки и утилиты (`shared/lib`: `cn`, `useDismiss`, `useFocusTrap`, `useBodyScrollLock`, `useSeo`, `useLiveContent`, …), ассеты.

## Сегменты внутри слайса

Каждый слайс может иметь сегменты: `ui/`, `model/`, `api/`, `lib/` (у страниц ещё `assets/`; `config/` допустим, но пока не используется). Не создавай пустой сегмент — если фиче не нужен свой `api`, сегмента `api/` не будет.

- `api/` — функции запросов поверх `api` из `@/shared/api/apiClient` (`fetchProjects`, `saveItemRequest`), без хуков.
- `model/` — типы (`types.ts`), query-хуки и ключи (`queries.ts`), сторы, zod-схемы форм (`schema.ts`), хуки оркестрации (`useLogin.ts`, `useProjectListing.ts`).
- `lib/` — чистые функции слайса (`format.ts`, `localize.ts`).
- `ui/` — компоненты.

## Компонент — файл

**Новый компонент — новый файл.** Как только из UI выделен отдельный функциональный компонент (`<Child/>`), он живёт в своём файле и импортируется, даже если приватный и нужен одному родителю. В существующем коде есть файлы с несколькими компонентами (`ProjectCard` + `ProjectCardSkeleton`, страницы `opportunities`, `admin`) — без задачи их не дробим, но новые компоненты туда не добавляем.

Речь о компонентах, а не о разметке: инлайновый JSX внутри `return` — норма.

Родитель композирует дочерние и прокидывает данные/колбэки пропсами, дочерние — презентационные. Из `index.ts` наружу торчит только публичная точка входа слайса; приватные под-компоненты в barrel не экспортируются, внутри слайса импортируются относительным путём.

## Хуки и логика

**Хук или компонент никогда не объявляется в теле другого компонента.** Иначе он пересоздаётся на каждый рендер и теряет идентичность — React Compiler это оптимизирует неправильно. Всё на верхнем уровне модуля или в своём файле.

**Нетривиальную логику слайса выноси в хук в `model/`, а не размазывай по `ui/`.** Состояние, обработчики, мутации и оркестрацию запросов собирает `model/use<Something>.ts` (`features/login-by-email/model/useLogin.ts`, `pages/projects/model/useProjectListing.ts`), а `ui/`-компонент зовёт хук и раскладывает результат по разметке. Если компонент просто дёргает готовый `useProjects()` и рендерит — отдельный хук лишний.

### Чек-лист «когда выносить»

Сработал хотя бы один пункт — компонент перегружен, дели его (логику в `model/`-хук, куски UI в свои файлы):

- **JSX длиннее ~100 строк**.
- **Больше 4–5 `useState` в одном месте**.
- **Больше двух `useEffect`, следящих за разными вещами**.
- **Разные уровни абстракции в одном файле** — каркас страницы рядом с мелкой вёрсткой иконки.
- **Смешаны бизнес-логика и UI** — компонент знает URL запроса, как валидировать поле и в какой цвет красить границу.
- **Copy-paste** разметки или обработчика в другой файл (→ `shared` или общий компонент).
- **Prop drilling** через 3 уровня ради одной строки внизу.

## Публичный API слайса

Импортировать слайс — всегда через его `index.ts`: `@/entities/project`, не `@/entities/project/ui/ProjectCard`. В `shared` то же для папок с `index.ts` (`@/shared/i18n`, `@/shared/lib`, `@/shared/ui/Button`); плоские файлы `shared/ui/*.tsx` и `shared/config/*.ts` импортируются по прямому пути, как в существующем коде.

## Стили

**Tailwind CSS v4** — утилитарными классами прямо в `className`, склейка через `cn()` из `@/shared/lib`. Токены объявлены в `@theme` в `app/styles/index.css`. CSS Modules в проекте нет — не заводи их. Повторяющиеся наборы классов одной страницы выносятся в константы `ui/styles.ts` (как в `pages/home/ui/styles.ts`).

Цвета — только токены или белый с прозрачностью по `DESIGN.md` (`bg-white/5`, `border-white/10`); сырой hex в классе — нарушение. Arbitrary-значения допустимы для геометрии и типографики, у которых токена нет.

Инлайн-стили (`style={{…}}`) — только для по-настоящему динамических величин (позиция, прогресс, вычисленный размер). Ховеры, фокусы и состояния — через Tailwind-варианты (`hover:`, `focus-visible:`, `aria-[…]:`, `data-[…]:`), а не через JS-обработчики.

Тексты интерфейса не хардкодятся строкой в компоненте: они идут из i18n (`shared/i18n`) или из Contentful-контента страницы, в двух локалях `en` и `uk`.
