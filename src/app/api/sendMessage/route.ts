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

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MAVERICK_API_KEY = process.env.MAVERICK_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GPT4O_API_KEY = process.env.GPT4O_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, model, imageUrl, thinkMode } = await req.json();

    if (!chatId || !message || !model) {
      console.error("Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (
      typeof message !== "string" ||
      message.length < 1 ||
      message.length > 2000
    ) {
      return NextResponse.json(
        { success: false, error: "Недопустимая длина сообщения" },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.log("Используем заглушку для отправки сообщений");
      const mockResponses = {
        deepseek:
          "Это ответ от DeepSeek модели (заглушка). Ваш запрос: " + message,
        maverick:
          "Это ответ от Maverick модели (заглушка). Ваш запрос: " + message,
        claude: "Это ответ от Claude модели (заглушка). Ваш запрос: " + message,
        gpt4o: "Это ответ от GPT-4o модели (заглушка). Ваш запрос: " + message,
      };

      const assistantMessage =
        mockResponses[model as keyof typeof mockResponses] ||
        "Это заглушка ответа от AI. Ваш запрос: " + message;

      return NextResponse.json({ success: true, message: assistantMessage });
    }

    const { error: userError } = await supabase.from("chat_messages").insert({
      chat_id: chatId,
      role: "user",
      content: message,
    });

    if (userError) {
      console.error("Supabase user message insert error:", userError);
      throw new Error(
        "Не удалось сохранить сообщение пользователя: " + userError.message
      );
    }

    const apiKeyMap = {
      deepseek: DEEPSEEK_API_KEY,
      maverick: MAVERICK_API_KEY,
      claude: CLAUDE_API_KEY,
      gpt4o: GPT4O_API_KEY,
    };
    const apiKey = apiKeyMap[model as keyof typeof apiKeyMap];
    if (!apiKey) {
      console.error("API key not found for model:", model);
      throw new Error("API-ключ для выбранной модели не найден");
    }

    const modelMap = {
      deepseek: "deepseek/deepseek-chat-v3-0324:free",
      maverick: "meta-llama/llama-4-maverick:free",
      claude: "anthropic/claude-3.7-sonnet",
      gpt4o: "openai/gpt-4o-mini",
    };
    const modelName = modelMap[model as keyof typeof modelMap];

    const userContent: {
      type: string;
      text?: string;
      image_url?: { url: string };
    }[] = [{ type: "text", text: message }];

    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }

    const systemPrompt = thinkMode
      ? "Ты полезный ИИ-ассистент. Рассуждай пошагово, объясняя свои мысли, прежде чем дать окончательный ответ."
      : "Ты полезный ИИ-ассистент.";

    const payload = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: false,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "OpenRouter API request failed:",
        response.status,
        errorText
      );
      throw new Error(`Ошибка API: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter API returned an error:", data.error);
      throw new Error(`Ошибка от OpenRouter: ${data.error.message}`);
    }

    const assistantMessage = data.choices[0]?.message?.content;
    if (!assistantMessage) {
      console.error(
        "OpenRouter API response does not contain assistant message"
      );
      throw new Error("Ответ модели пустой");
    }

    const { error: assistantError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        role: "assistant",
        content: assistantMessage,
      });

    if (assistantError) {
      console.error("Supabase assistant message insert error:", assistantError);
      throw new Error(
        "Не удалось сохранить ответ модели: " + assistantError.message
      );
    }

    return NextResponse.json({ success: true, message: assistantMessage });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in /api/sendMessage:", errorMessage);

    return NextResponse.json({
      success: true,
      message: "Это заглушка ответа из-за ошибки: " + errorMessage,
    });
  }
}
