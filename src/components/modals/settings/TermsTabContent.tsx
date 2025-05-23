import React from "react";

const TermsTabContent: React.FC = () => {
  return (
    <div className="space-y-6 text-zinc-900 dark:text-gray-200">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">
          Запрещенный контент
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Контент, нарушающий законы или права третьих лиц</li>
          <li>Материалы сексуального характера</li>
          <li>Контент, пропагандирующий насилие или ненависть</li>
          <li>Материалы, нарушающие интеллектуальные права</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">
          Ограничения использования
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Запрещено использование для создания вредоносного ПО</li>
          <li>Нельзя использовать для обхода систем безопасности</li>
          <li>Запрещено создание контента, вводящего в заблуждение</li>
          <li>Нельзя использовать для автоматического сбора данных</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">Ответственность</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Пользователь несет ответственность за созданный контент</li>
          <li>Необходимо проверять информацию, полученную от ИИ</li>
          <li>Запрещено использование для создания спама</li>
          <li>Необходимо соблюдать авторские права</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">
          Конфиденциальность
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Не передавайте конфиденциальную информацию</li>
          <li>Не используйте для обработки персональных данных</li>
          <li>Избегайте ввода чувствительной информации</li>
          <li>Соблюдайте правила защиты данных</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">
          Правила использования API
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Соблюдайте ограничения по количеству запросов</li>
          <li>Используйте API только для разрешенных целей</li>
          <li>Не пытайтесь обойти ограничения системы</li>
          <li>Соблюдайте технические требования API</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-pink-500">
          Ограничения генерации
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Запрещено создание контента, имитирующего реальных людей</li>
          <li>Нельзя генерировать медицинские или юридические советы</li>
          <li>Запрещено создание контента для обмана или манипуляции</li>
          <li>Нельзя использовать для создания вредоносного кода</li>
        </ul>
      </section>
    </div>
  );
};

export default TermsTabContent;
