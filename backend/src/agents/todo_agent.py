from typing import Any, Dict
from agents import Agent, function_tool

from ..mcp.tools import create_todo, get_todos, update_todo, delete_todo

# Define instructions for the agent
INSTRUCTIONS = """You are a helpful and efficient Todo Assistant.
Your goal is to help users manage their todo list using the provided tools.

Capabilities:
- You can create, read, update, and delete todos.
- Use the provided tools for all database operations. Do NOT halluncinate tasks.
- If a user request is ambiguous (e.g., "delete the task" when multiple exist), ask for clarification.
- Be concise in your responses.
- When listing todos, use the format provided by the tool output or a markdown list.
- Always assume the current user is the one authenticated in the context.

Special Intents:
- "Mark as complete": Use the update_todo tool with status='completed' or completed=True.
- "Delete it": If the context is clear (user just viewed/created a task), infer the ID. Otherwise ask "Which task?".
- "Empty search": If get_todos returns nothing, suggest creating a task.

Output Format:
- Use Markdown for rich text.
- Confirm actions clearly ("I've added 'Buy milk' to your list").
"""

# We'll create a factory function to instantiate the agent for a request
# This allows us to inject things if needed, though the SDK Agent is stateless logic-wise
# apart from conversation history which is handled by the Runner/Session.

def get_todo_agent() -> Agent:
    """Returns the configured Todo Agent using Groq."""
    return Agent(
        name="TodoAssistant",
        instructions=INSTRUCTIONS,
        tools=[
            function_tool(create_todo),
            function_tool(get_todos),
            function_tool(update_todo),
            function_tool(delete_todo),
        ],
        model="llama-3.3-70b-versatile",  # Groq's free tier model
    )
