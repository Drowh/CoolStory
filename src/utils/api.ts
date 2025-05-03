

export async function sendMessageToAPI(message: string): Promise<string> {
  const response = await fetch("https://api.neuroservice.com/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEUROSERVICE_API_KEY}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Ошибка при запросе к API");
  }

  const data = await response.json();
  return data.reply;
}

export async function generateTitle(messages: string[]): Promise<string> {
  if (messages.length === 0) return "Новый чат";

  const firstMessage = messages[0];
  const prompt = `Сгенерируй заголовок для чата на основе этого сообщения: "${firstMessage}"`;

  const response = await fetch("https://api.neuroservice.com/v1/generate-title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEUROSERVICE_API_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    return firstMessage.slice(0, 30) + "...";
  }

  const data = await response.json();
  return data.title;
}
