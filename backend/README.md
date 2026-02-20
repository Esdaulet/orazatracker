# Oraza App - Backend (Firebase Cloud Functions)

Firebase Cloud Functions для обработки логики на сервере.

## Функции

### 1. `createUserProfile` (Триггер на создание пользователя)
- Автоматически создаёт профиль пользователя в Realtime Database
- Срабатывает при регистрации новых пользователей

### 2. `deleteUserData` (Триггер на удаление пользователя)
- Удаляет все данные пользователя из БД
- Очищает привычки и логи

### 3. `getDailySummary` (HTTP функция)
- Возвращает суммарные данные по привычкам за день
- Вызов: `functions.httpsCallable('getDailySummary')({ date: 'YYYY-MM-DD' })`

### 4. `getMonthlyStats` (HTTP функция)
- Возвращает статистику за месяц
- Вызов: `functions.httpsCallable('getMonthlyStats')({ year: 2024, month: 2 })`

## Установка

```bash
npm install
```

## Локальное тестирование

```bash
npm run serve
```

Это запустит эмуляторы Firebase локально.

## Развёртывание

```bash
npm run deploy
```

## Логи

Просмотреть логи функций:

```bash
npm run logs
```