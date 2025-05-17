export async function sendMessageToAPI(message: string): Promise<string> {
  const response = await fetch("https://api.neuroservice.com/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEUROSERVICE_API_KEY}`,
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
  const text = messages.join(" ").replace(/\n/g, " ");
  const words = text.split(" ").filter(Boolean);
  const short = words.slice(0, 4).join(" ");
  return words.length > 4 ? short + "..." : short;
}
