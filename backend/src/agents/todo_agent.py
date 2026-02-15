"""
TaskFlow AI Agent — uses LLM function calling / tool use architecture.

Flow:
1. User message is sent to the LLM with tool schemas.
2. LLM decides whether to call tools (add_task, delete_task, edit_task, etc.)
   or respond directly.
3. If tools are called, we execute them and feed results back to the LLM.
4. LLM produces the final user-facing response.
"""
import json
import os
from dataclasses import dataclass, field

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from src.agents.tools import (
    TOOL_SCHEMAS,
    MUTATING_TOOLS,
    ToolContext,
    execute_tool,
)


GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are TaskFlow AI — a helpful, concise task-management assistant.

You have access to tools that manage the user's tasks in a real database.
ALWAYS use tools for task operations. Never fabricate task data.

RULES:
1. When the user wants to add/create a task → call `add_task`
2. When the user wants to delete/remove a task → call `delete_task`
3. When the user wants to edit/update/rename a task → call `edit_task`
4. When the user wants to see/list/show tasks → call `list_tasks`
5. When the user wants to complete/finish/mark done a task → call `toggle_task` with completed=true
6. When the user wants to uncheck/reopen a task → call `toggle_task` with completed=false
7. If a request is ambiguous, call `list_tasks` first so the user can pick an ID.
8. After every tool call, confirm the action clearly to the user.
9. For general conversation (greetings, questions, etc.), respond directly without tools.
10. Use Markdown formatting for readability.
"""


@dataclass
class AgentResult:
    """Result from running the agent."""
    response: str
    tool_calls_made: list[dict] = field(default_factory=list)
    task_mutated: bool = False


async def run_agent(
    message: str,
    user_id: str,
    db: AsyncSession,
    conversation_history: list[dict] | None = None,
) -> AgentResult:
    """
    Run the tool-calling agent loop.

    1. Send user message + tool schemas to Groq LLM.
    2. If LLM returns tool_calls, execute each one.
    3. Feed tool results back to LLM for final response.
    4. Repeat until LLM responds without tool_calls (max 5 iterations).
    """
    ctx = ToolContext(user_id=user_id, db=db)

    # Build message history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if conversation_history:
        messages.extend(conversation_history)

    messages.append({"role": "user", "content": message})

    all_tool_calls: list[dict] = []
    task_mutated = False

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Agent loop — allow up to 5 rounds of tool calling
        for _ in range(5):
            response = await client.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "tools": TOOL_SCHEMAS,
                    "tool_choice": "auto",
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )

            if response.status_code != 200:
                error_text = response.text
                return AgentResult(
                    response=f"I'm having trouble connecting right now. Please try again.",
                    tool_calls_made=all_tool_calls,
                    task_mutated=task_mutated,
                )

            data = response.json()
            choice = data["choices"][0]
            assistant_message = choice["message"]

            # If no tool calls, we're done — return the text response
            if not assistant_message.get("tool_calls"):
                final_text = assistant_message.get("content", "")
                return AgentResult(
                    response=final_text or "Done!",
                    tool_calls_made=all_tool_calls,
                    task_mutated=task_mutated,
                )

            # LLM wants to call tools — execute them
            messages.append(assistant_message)

            for tool_call in assistant_message["tool_calls"]:
                func_name = tool_call["function"]["name"]
                func_args = json.loads(tool_call["function"]["arguments"]) or {}

                # Execute the tool against the real database
                tool_result = await execute_tool(ctx, func_name, func_args)

                # Track what was called
                all_tool_calls.append({
                    "tool": func_name,
                    "arguments": func_args,
                    "result": json.loads(tool_result),
                })

                # Check if this tool mutates data
                if func_name in MUTATING_TOOLS:
                    task_mutated = True

                # Feed the result back to the LLM
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": tool_result,
                })

    # If we exhausted iterations, return what we have
    return AgentResult(
        response="I processed your request.",
        tool_calls_made=all_tool_calls,
        task_mutated=task_mutated,
    )
