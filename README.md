# Мои Финансы

**PWA-приложение** для управления личными финансами на Angular 20 + Firebase + PrimeNG 20.

## Возможности

- **Dashboard** — баланс, доходы/расходы за выбранный период, быстрый переход к добавлению
- **Транзакции** — список операций с фильтрацией по типу, категории, дате
- **Категории** — кастомный диалог с выбором иконок, разделение на доходы/расходы
- **Аналитика** — графики по категориям (Chart.js), динамика за месяц
- **Авторизация** — email/password через Firebase Auth
- **Изоляция данных** — каждый пользователь видит только свои транзакции и категории
- **Адаптивность** — мобильная вёрстка до 640px, гамбургер-меню
- **PWA** — Service Worker, офлайн-доступ, установка на устройство

## Технологии

| Компонент | Версия |
|-----------|--------|
| Angular | 20 |
| Firebase | 11 |
| PrimeNG | 20 |
| Chart.js | 4 |
| Tailwind CSS | 4 (через PostCSS, утилитарные классы в `styles.scss`) |

## Установка

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Veselchak-git/MyMoney.git
cd MyMoney
```

### 2. Настроить Firebase

Создай проект в [Firebase Console](https://console.firebase.google.com/):
- Включи **Authentication** (только **Email/Password** — Google OAuth отключён)
- Создай базу **Firestore Database** в режиме `test mode` (потом разверни `firestore.rules`)
- Зарегистрируй **Web-приложение** в настройках проекта

Скопируй файл настроек:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Заполни `environment.ts` данными из Firebase Console:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIza...',
    authDomain: 'my-money-xxxxx.firebaseapp.com',
    projectId: 'my-money-xxxxx',
    storageBucket: 'my-money-xxxxx.firebasestorage.app',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  },
};
```

### 3. Установить зависимости и запустить

```bash
npm install
ng serve
```

Приложение будет доступно на `http://localhost:4200/`.

### 4. Развернуть правила Firestore

Файл `firestore.rules` уже в репозитории. Скопируй его содержимое в **Firebase Console → Firestore → Rules** и нажми **Publish**.

## Сборка

```bash
ng build --configuration production
```

Артефакты в `dist/MyMoney/browser/`.

## Тесты

```bash
ng test
```

## Структура проекта

```
src/
├── app/
│   ├── guards/              # AuthGuard
│   ├── models/              # Transaction, Category
│   ├── pages/               # dashboard, transactions, auth, categories, analytics
│   ├── services/            # TransactionService, CategoryService, AnalyticsService
│   └── utils/               # formatAmount, formatShortDate
├── environments/            # Firebase config (gitignored)
├── index.html
└── styles.scss              # Глобальные стили + Tailwind utility classes
```

## Лицензия

MIT
