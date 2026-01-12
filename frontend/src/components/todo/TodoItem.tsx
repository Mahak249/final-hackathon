"use client";

import { useState } from "react";
import { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, data: { title: string; description?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({
  todo,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    if (!editTitle.trim()) {
      return;
    }
    await onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
  }

  async function handleConfirmDelete() {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      setIsDeleting(true);
      await onDelete(todo.id);
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <li className="todo-item">
        <div style={{ flex: 1 }}>
          <div className="form-group" style={{ marginBottom: "8px" }}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Todo title"
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: "8px" }}>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={!editTitle.trim()}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      />
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        {todo.description && (
          <div className="todo-description">{todo.description}</div>
        )}
      </div>
      <div className="todo-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onStartEdit}
          disabled={isDeleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleConfirmDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </li>
  );
}
