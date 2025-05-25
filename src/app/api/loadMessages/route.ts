import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

const MAX_CHAT_ID = 1000000;
const MAX_MESSAGES = 100000;

const validateChatId = (chatId: string | null): number => {
  if (!chatId) {
    throw new Error("Missing chatId parameter");
  }

  const id = parseInt(chatId);
  if (isNaN(id) || id <= 0 || id > MAX_CHAT_ID) {
    throw new Error("Invalid chatId parameter");
  }

  return id;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = validateChatId(searchParams.get("chatId"));

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(MAX_MESSAGES);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Не удалось загрузить сообщения: " + error.message);
    }

    if (!data || !Array.isArray(data)) {
      throw new Error("Некорректный формат данных");
    }

    const messages = data.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at,
    }));

    return NextResponse.json({ success: true, data: messages });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Ошибка в /api/loadMessages:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      {
        status:
          error instanceof Error && error.message.includes("Missing")
            ? 400
            : 500,
      }
    );
  }
}
