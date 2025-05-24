# CoolStory

💫 [Live Demo](https://cool-story-six.vercel.app/)

## 📝 Описание

CoolStory - это современное веб-приложение для общения с AI, построенное на Next.js. Проект предоставляет удобный интерфейс для взаимодействия с GPT-4o-mini и другими моделями, позволяя пользователям вести диалоги, сохранять историю чатов и управлять своими беседами и добавлять их в избранные.

## 🚀 Технологии

- **Frontend:**

  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Zustand (управление состоянием)
  - React Window (виртуализация списков)
  - React Markdown (рендеринг markdown)
  - FontAwesome (иконки)

- **Backend:**

  - Supabase (аутентификация и база данных)
  - Upstash Redis (rate limiting)
  - Next.js API Routes

- **Тестирование:**
  - Jest
  - React Testing Library

## 🛠 Установка и запуск

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/Drowh/CoolStory.git
   cd CoolStory
   ```

2. Установите зависимости:

   ```bash
   npm install
   # или
   yarn install
   ```

3. Создайте файл `.env.local` и добавьте необходимые переменные окружения:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

4. Запустите проект в режиме разработки:
   ```bash
   npm run dev
   # или
   yarn dev
   ```

## 📁 Структура проекта

```
src/
├── app/              # Next.js app router
├── components/       # React компоненты
│   ├── auth/        # Компоненты аутентификации
│   ├── chat/        # Компоненты чата
│   ├── dialogs/     # Диалоговые окна
│   ├── layout/      # Компоненты layout
│   ├── modals/      # Модальные окна
│   └── ui/          # UI компоненты
├── contexts/        # React контексты
├── hooks/           # Кастомные хуки
├── services/        # Сервисы для работы с API
├── stores/          # Zustand сторы
├── styles/          # Стили
├── types/           # TypeScript типы
└── utils/           # Утилиты и хелперы
```

## ✨ Возможности

- 🔐 Аутентификация через Supabase
- 💬 Чат с GPT-4o-mini, Claude 3.7 Sonnet, Marevick, DeepSeek V3
- 📝 Поддержка Markdown в сообщениях
- 🎨 Подсветка синтаксиса кода
- 📱 Адаптивный дизайн
- 🔍 Поиск по истории чатов
- 📂 Организация чатов в папки
- 🎤 Голосовой ввод
- 🎨 Обработка изображения
- 🌙 Темная/светлая тема
- ⚡ Виртуализация длинных списков
- 🔄 Rate limiting для API

## 🤝 Примеры использования

1. **Создание нового чата:**

   - Нажмите кнопку "Новый чат" в боковой панели
   - Введите сообщение и отправьте

2. **Управление чатами:**

   - Создавайте папки(темки) для организации чатов
   - Перетаскивайте чаты между папками
   - Используйте поиск для быстрого доступа

3. **Настройки:**
   - Переключение темы
   - Выбор аватарки
   - Автоматическое скрытие папок

## ❓ FAQ

**Q: Как работает аутентификация?**  
A: Проект использует Supabase для аутентификации. Пользователи могут войти через email/password.

**Q: Как сохраняются чаты?**  
A: Все чаты сохраняются в базе данных Supabase и синхронизируются между устройствами.

**Q: Есть ли ограничения на использование API?**  
A: Да, реализован rate limiting через Upstash Redis для защиты от злоупотреблений.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 👨‍💻 Автор

- **DrowDev** - [GitHub](https://github.com/Drowh)

---

⭐ Star this repository if you find it useful!
