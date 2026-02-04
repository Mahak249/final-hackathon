import { NextRequest, NextResponse } from "next/server";

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_API_URL = "https://api.cohere.ai/v1/chat";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Check if message is task-related
function isTaskRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const taskKeywords = [
    "add task", "add todo", "create task", "create todo", "new task", "new todo",
    "delete task", "delete todo", "remove task", "remove todo",
    "edit task", "edit todo", "update task", "update todo", "change task",
    "complete task", "complete todo", "mark complete", "mark done", "finish task",
    "show tasks", "show todos", "list tasks", "list todos", "my tasks", "my todos",
    "get tasks", "get todos", "what are my tasks", "what are my todos"
  ];
  return taskKeywords.some(keyword => lowerMessage.includes(keyword));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Handle creator questions directly
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("who created you") ||
        lowerMessage.includes("who made you") ||
        lowerMessage.includes("who built you") ||
        lowerMessage.includes("who is your creator")) {
      return NextResponse.json({
        response: "I was created by Mehak Rehman.",
        chatId: "creator-response",
      });
    }

    // If task-related, route to backend agent
    if (isTaskRelated(message)) {
      // Get auth cookie from request to pass to backend
      const cookies = request.headers.get("cookie") || "";

      try {
        const backendResponse = await fetch(`${BACKEND_URL}/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
          },
          body: JSON.stringify({
            message: message,
          }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          return NextResponse.json({
            response: data.response,
            chatId: data.conversation_id,
          });
        }
        // If backend fails (e.g., not logged in), fall through to Cohere
        console.log("Backend agent unavailable, falling back to Cohere");
      } catch (backendError) {
        console.log("Backend agent error, falling back to Cohere:", backendError);
      }
    }

    // Fall back to Cohere for general chat
    if (!COHERE_API_KEY) {
      return NextResponse.json(
        { error: "Cohere API key not configured" },
        { status: 500 }
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
        model: "command-a-03-2025",
        message: message,
        chat_history: formattedHistory,
        preamble: `You are TaskFlow AI, a helpful assistant for a todo/task management application.
You help users with:
- Managing their tasks and todos
- Providing productivity tips
- Answering questions about task management
- Giving encouragement and motivation

When users want to add, delete, edit, or view tasks, tell them you can help with that.
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
