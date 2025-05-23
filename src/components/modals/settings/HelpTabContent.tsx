import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface HelpItem {
  icon: IconProp;
  title: string;
  description: string;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

const HelpTabContent: React.FC = () => {
  const helpSections: HelpSection[] = [
    {
      title: "Основные функции",
      items: [
        {
          icon: "comments",
          title: "Чат с ИИ",
          description:
            "Общайтесь с искусственным интеллектом, задавайте вопросы и получайте подробные ответы.",
        },
        {
          icon: "microphone",
          title: "Голосовой ввод",
          description:
            "Используйте микрофон для голосового ввода сообщений. Нажмите кнопку микрофона чтобы пошла запись, повторное нажатие прерывает запись.",
        },
        {
          icon: "folder",
          title: "Темы",
          description:
            "Создавайте темки(папки(категории)) для организации чатов. Добавляйте чаты в темки через меню действий, нажми на кнопку темки.",
        },
      ],
    },
    {
      title: "Персонализация",
      items: [
        {
          icon: "user-circle",
          title: "Аватары",
          description:
            "Выберите свой аватар в профиле. Доступно множество вариантов на любой вкус.",
        },
        {
          icon: "moon",
          title: "Темная /светлая тема",
          description:
            "Переключайтесь между светлой и темной темой в профиле. Настройки сохраняются автоматически.",
        },
      ],
    },
    {
      title: "Советы",
      items: [
        {
          icon: "lightbulb",
          title: "Эффективное общение",
          description:
            "Задавайте подробные и конкретные вопросы, чтобы получить наиболее точные и полезные ответы от ИИ.",
        },
        {
          icon: "copy",
          title: "Копирование сообщений",
          description:
            "Нажмите на иконку копирования рядом с сообщением, чтобы скопировать его содержимое.",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {helpSections.map((section, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-gray-200">
            {section.title}
          </h3>
          <div className="grid gap-4">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="p-4 rounded-lg bg-zinc-50 dark:bg-gray-800/50 border border-zinc-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-500">
                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-gray-100 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HelpTabContent;
