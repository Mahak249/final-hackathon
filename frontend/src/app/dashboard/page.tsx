"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types";
import { api } from "@/lib/api";
import TodoList from "@/components/todo/TodoList";
import TodoForm from "@/components/todo/TodoForm";

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const data = await api.todos.list();
      setTodos(data.todos);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTodo(data: { title: string; description?: string }) {
    try {
      const newTodo = await api.todos.create(data);
      setTodos([newTodo, ...todos]);
      setShowForm(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to create todo");
    }
  }

  async function handleToggleTodo(id: string, completed: boolean) {
    try {
      const updatedTodo = await api.todos.toggle(id, completed);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update todo");
    }
  }

  async function handleUpdateTodo(
    id: string,
    data: { title: string; description?: string }
  ) {
    try {
      const updatedTodo = await api.todos.update(id, data);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update todo");
    }
  }

  async function handleDeleteTodo(id: string) {
    try {
      await api.todos.delete(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to delete todo");
    }
  }

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>Loading todos...</p>
      </div>
    );
  }

  return (
    <>
      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <span style={{ color: "#666" }}>
            {todos.length} {todos.length === 1 ? "todo" : "todos"}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add Todo"}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: "16px" }}>
            <TodoForm
              onSubmit={handleCreateTodo}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </>
  );
}
