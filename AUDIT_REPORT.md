
# AutoSphere Code Audit Report
Date: 06.12.2025

## Executive Summary
Аудит выявил несколько критических проблем (P0), блокирующих успешную сборку и безопасную эксплуатацию проекта в production. Также обнаружен ряд важных (P1) и средних (P2) проблем, касающихся безопасности, архитектуры и производительности.

- **Total issues found:** 14
- **P0 (Critical):** 3
- **P1 (High):** 3
- **P2 (Medium):** 8

Рекомендуется немедленно приступить к исправлению проблем уровня P0, так как без этого развертывание невозможно.

---

## Critical Issues (P0)

### A1. Next.js 15: Асинхронные `params` в динамических роутах
- **Severity:** P0 (Blocker)
- **Files affected:** 
  - `src/app/api/admin/users/[id]/[action]/route.ts`
  - `src/app/profile/[id]/page.tsx`
  - `src/app/car/[id]/page.tsx`
  - `src/app/communities/[id]/page.tsx`
  - `src/app/communities/[id]/create-post/page.tsx`
  - `src/app/communities/[id]/posts/[postId]/page.tsx`
  - `src/app/events/[id]/page.tsx`
  - `src/app/marketplace/[id]/page.tsx`
- **Impact:** Сборка проекта (`npm run build`) завершается с ошибкой типизации, так как `params` теперь является `Promise`.
- **Fix:** Обновить типизацию и использовать `await` для получения `params` во всех затронутых файлах.

### A2. Tailwind CSS v3/v4: Конфликт версий и конфигурации
- **Severity:** P0 (Blocker)
- **Files affected:** `package.json`, `tailwind.config.ts`, `globals.css`. Отсутствует `postcss.config.js`.
- **Impact:** Сборка падает с ошибкой `Cannot apply unknown utility class bg-background`. Это вызвано тем, что в `package.json` указана `latest` версия Tailwind, которая может разрешаться в v4, в то время как конфигурация и CSS написаны под v3.
- **Fix:** Жестко зафиксировать версии `tailwindcss`, `postcss`, `autoprefixer` на стабильных v3. Создать корректный `postcss.config.js` и убедиться, что `tailwind.config` и `globals.css` соответствуют синтаксису v3.

### B2. Admin API: Небезопасная авторизация
- **Severity:** P0 (Blocker)
- **Files affected:** `src/app/api/admin/users/[id]/[action]/route.ts`
- **Impact:** Любой пользователь может выполнять действия администратора, подделав заголовок `x-user-id`. Это критическая уязвимость.
- **Fix:** Заменить проверку заголовка на верификацию Firebase ID token, передаваемого в `Authorization: Bearer <token>` заголовке. Дополнительно проверять роль пользователя (`admin`/`moderator`) в Firestore.

---

## High Priority Issues (P1)

### A3. TypeScript: Неявный тип `any`
- **Severity:** P1 (High)
- **Files affected:** `src/app/profile/[id]/page.tsx`, `src/app/posts/page.tsx`, `src/app/events/[id]/page.tsx` и другие серверные компоненты, получающие данные.
- **Impact:** Снижает надежность кода и может приводить к runtime-ошибкам. `npm run typecheck` завершается с ошибками.
- **Fix:** Явно типизировать параметры в методах `.map()`, `.filter()` и других, используя `QueryDocumentSnapshot` и `DocumentData` из `firebase-admin/firestore`.

### B3. Firestore Security Rules: Недостаточно строгие правила
- **Severity:** P1 (High)
- **Files affected:** `firestore.rules`
- **Impact:** Потенциальная утечка данных и несанкционированный доступ. Например, `allow read: if true;` на коллекции `users` позволяет любому получить список всех пользователей. Правила на запись не всегда валидируют данные.
- **Fix:** Пересмотреть все правила. Заменить `if true` на `if request.auth != null`. Запретить изменение системных полей (роль, статус) напрямую клиентом. Добавить валидацию размеров полей (e.g., `content.size() < 10000`).

### C3. Типы: Дублирование и несогласованность
- **Severity:** P1 (High)
- **Files affected:** Множество компонентов, например, `src/components/profile/ProfileHero.tsx`.
- **Impact:** Усложняет поддержку и рефакторинг. Изменение одной структуры данных требует правок во многих местах.
- **Fix:** Централизовать все доменные типы (User, Post, Car и т.д.) в едином файле `src/lib/types.ts` и заменить все локальные/inline-типы на импорты из этого файла.

---

## Medium Priority Issues (P2)

### B1. Firebase Admin SDK: Отсутствие `server-only`
- **Severity:** P2 (Medium)
- **Files affected:** Все файлы, импортирующие `firebase-admin`.
- **Impact:** Потенциальный риск попадания серверного кода в клиентский бандл.
- **Fix:** Добавить `import 'server-only';` в начало каждого модуля, который использует Admin SDK.

### C1. Server/Client Boundaries: Неявные зависимости
- **Severity:** P2 (Medium)
- **Files affected:** `src/app/admin/users/page.tsx` и другие.
- **Impact:** Использование `onSnapshot` в клиентских компонентах без должной обработки может приводить к "client-side exceptions" и утечкам памяти.
- **Fix:** Провести ревизию всех `useEffect` с подписками на Firestore. Убедиться, что отписка (`unsubscribe`) всегда выполняется в `return` функции. Рассмотреть вынос некоторых данных в серверные компоненты.

### C2. Error Pages: Отсутствие специфичных страниц
- **Severity:** P2 (Medium)
- **Files affected:** `src/app/posts/`
- **Impact:** Пользователи видят общую 404-страницу вместо контекстно-зависимой.
- **Fix:** Создать файл `src/app/posts/not-found.tsx` для более релевантного сообщения ("Пост не найден").

### C4. Недоделанные компоненты (Hardcode/Placeholders)
- **Severity:** P2 (Medium)
- **Files affected:** `src/app/admin/page.tsx`, `src/components/profile/ProfileSidebar.tsx`, `src/app/page.tsx`.
- **Impact:** Вводит в заблуждение и создает неполное впечатление о функционале.
- **Fix:** Заменить хардкоженные данные (тренды, ачивки, топ авторы) на реальные запросы к Firestore или временные UI-заглушки "В разработке".

### D2. Performance: Оптимизация `next/image`
- **Severity:** P2 (Medium)
- **Files affected:** Компоненты с Hero-изображениями (`ProfileHero`, `CarHero`, главная страница).
- **Impact:** Неоптимальная загрузка изображений в первой видимой области (LCP).
- **Fix:** Добавить атрибут `priority` к компонентам `next/image`, которые являются основными на странице.

### D3. CI/CD: Отсутствие базовых проверок
- **Severity:** P2 (Medium)
- **Files affected:** Отсутствует `ci.yml`.
- **Impact:** В `main` ветку может попасть код с ошибками линтера или типов.
- **Fix:** Создать базовый GitHub Actions workflow для запуска `lint` и `typecheck` на `push` и `pull_request`.

### D4. Мониторинг: Отсутствие трекинга ошибок
- **Severity:** P2 (Medium)
- **Impact:** Нет возможности централизованно отслеживать ошибки, возникающие у пользователей в production.
- **Fix:** Рекомендовать интеграцию Sentry или аналогичного сервиса.

### C5. Vercel Blob: Отсутствие валидации
- **Severity:** P2 (Medium)
- **Files affected:** `src/hooks/use-file-upload.ts`
- **Impact:** Можно загрузить файлы любого типа и размера, что может привести к лишним расходам и проблемам безопасности.
- **Fix:** Добавить в хук `useFileUpload` явную проверку на тип (`image/jpeg`, `image/png`) и размер файла перед отправкой в API.
