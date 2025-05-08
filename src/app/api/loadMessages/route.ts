import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId parameter" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("chat_id", parseInt(chatId))
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error("Не удалось загрузить сообщения: " + error.message);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}