"use client";

import { useState } from "react";

interface TodoFormProps {
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: { title: string; description?: string };
  isEditing?: boolean;
}

export default function TodoForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to save todo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 0 }}>
      <h3 style={{ marginBottom: "16px" }}>
        {isEditing ? "Edit Todo" : "New Todo"}
      </h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? "Saving..." : isEditing ? "Update Todo" : "Add Todo"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
