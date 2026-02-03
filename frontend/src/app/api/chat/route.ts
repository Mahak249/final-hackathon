import { NextRequest, NextResponse } from "next/server";

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_API_URL = "https://api.cohere.ai/v1/chat";

export async function POST(request: NextRequest) {
  try {
    if (!COHERE_API_KEY) {
      return NextResponse.json(
        { error: "Cohere API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Format chat history for Cohere API
    const formattedHistory = chatHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "USER" : "CHATBOT",
      message: msg.content,
    }));

    const response = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        message: message,
        chat_history: formattedHistory,
        preamble: `You are TaskFlow AI, a helpful assistant for a todo/task management application.
You help users with:
- Managing their tasks and todos
- Providing productivity tips
- Answering questions about task management
- Giving encouragement and motivation

Be friendly, concise, and helpful. Keep responses brief but informative.`,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Cohere API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      response: data.text,
      chatId: data.generation_id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
