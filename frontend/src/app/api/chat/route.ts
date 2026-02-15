import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Route handler ───────────────────────────────────────────────────────────
// All messages go to the backend agent. The LLM automatically decides
// which tools to call (add_task, delete_task, edit_task, etc.) via
// function calling — no client-side intent detection needed.

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
    if (
      lowerMessage.includes("who created you") ||
      lowerMessage.includes("who made you") ||
      lowerMessage.includes("who built you") ||
      lowerMessage.includes("who is your creator")
    ) {
      return NextResponse.json({
        response: "I was created by Mehak Rehman.",
        chatId: "creator-response",
        taskMutated: false,
        toolCalls: [],
      });
    }

    // Forward ALL messages to the backend agent.
    // The LLM uses function calling to automatically trigger tools
    // (add_task, delete_task, edit_task, list_tasks, toggle_task)
    // based on the user's natural language message.
    const cookies = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    // Extract token from Authorization header or cookie
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
    if (!token) {
      const cookiePairs = cookies.split(";");
      const authCookie = cookiePairs.find((c) => c.trim().startsWith("access_token="));
      if (authCookie) {
        token = authCookie.trim().split("=")[1];
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      // Send token in request body since HF Spaces proxy strips Authorization headers
      const backendResponse = await fetch(`${BACKEND_URL}/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, token }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json({
          response: data.response,
          chatId: data.conversation_id,
          taskMutated: data.task_mutated || false,
          toolCalls: data.tool_calls || [],
        });
      }

      // Backend returned an error
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error("Backend error:", backendResponse.status, errorData);

      return NextResponse.json({
        response:
          "I'm having trouble connecting to the task service. Please try again.",
        chatId: "error",
        taskMutated: false,
        toolCalls: [],
      });
    } catch (backendError) {
      console.error("Backend connection error:", backendError);
      return NextResponse.json({
        response:
          "I'm unable to reach the task service right now. Please make sure the backend is running.",
        chatId: "error",
        taskMutated: false,
        toolCalls: [],
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
