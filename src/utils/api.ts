// Временная имитация задержки ответа от API
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessageToAPI(message: string): Promise<string> {
  try {
    // Здесь в будущем будет реальный запрос к API
    await delay(1000);

    // Временная имитация ответа
    const responses = [
      "Спасибо за ваше сообщение! Я получил его и обрабатываю.",
      "Интересный вопрос! Давайте разберем его подробнее.",
      "Я понимаю вашу точку зрения. Вот что я думаю по этому поводу...",
      "Это отличная тема для обсуждения. Позвольте поделиться своими мыслями.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    throw new Error(
      "Не удалось отправить сообщение. Пожалуйста, попробуйте позже."
    );
  }
}

export async function generateTitle(messages: string[]): Promise<string> {
  try {
    // Здесь в будущем будет реальный запрос к API для генерации заголовка
    await delay(500);

    // Временная логика генерации заголовка
    const firstMessage = messages[0] || "";
    const title =
      firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "");
    return title || "Новый чат";
  } catch (error) {
    console.error("Ошибка при генерации заголовка:", error);
    return "Новый чат";
  }
}
