import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

const mockMessages = {
  "125": [
    { role: "user", content: "Привет, как дела?" },
    {
      role: "assistant",
      content: "Здравствуйте! У меня всё хорошо. Чем могу помочь?",
    },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json(
      { success: false, error: "Missing chatId parameter" },
      { status: 400 }
    );
  }

  if (!supabaseUrl || !supabaseKey) {
    console.log("Используем тестовые данные для чата:", chatId);
    const mockData = mockMessages[chatId as keyof typeof mockMessages] || [];
    return NextResponse.json({ success: true, data: mockData });
  }

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("chat_id", parseInt(chatId))
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Не удалось загрузить сообщения: " + error.message);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Ошибка в /api/loadMessages:", errorMessage);

    console.log("Возвращаем тестовые данные из-за ошибки");
    const mockData = mockMessages[chatId as keyof typeof mockMessages] || [];
    return NextResponse.json({ success: true, data: mockData });
  }
}
