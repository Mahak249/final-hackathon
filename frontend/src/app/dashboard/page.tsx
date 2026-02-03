"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types";
import { api } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  // Edit modal state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleCreateTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newTodo = await api.todos.create({
        title: newTaskTitle,
        description: newTaskDescription.trim() || undefined
      });
      setTodos([newTodo, ...todos]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowForm(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to create todo");
    } finally {
      setIsSubmitting(false);
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
    setIsSubmitting(true);
    try {
      const updatedTodo = await api.todos.update(id, data);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
      setEditingTodo(null);
      setEditTitle("");
      setEditDescription("");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update todo");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal(todo: Todo) {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  }

  function closeEditModal() {
    setEditingTodo(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;
    await handleUpdateTodo(editingTodo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined
    });
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

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" ||
      (activeTab === "active" && !todo.completed) ||
      (activeTab === "completed" && todo.completed);
    return matchesSearch && matchesTab;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring" />
        </div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Ambient Background Glow */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <Link href="/" className="logo">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="10" fill="url(#logoGradient)" />
                  <path d="M9 13L14 18L23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">TaskFlow</span>
            </Link>
          </div>
          <div className="header-right">
            <button className="btn btn-ghost btn-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
            <div className="user-avatar">
              <span>U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="stat-icon total">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{todos.length}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-glow" />
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="stat-icon active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-glow" />
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="stat-icon completed">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-glow" />
          </div>
        </div>

        {/* Task Input Section */}
        <div className="task-input-section animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {showForm ? (
            <form onSubmit={handleCreateTodo} className="task-form">
              <div className="input-wrapper input-glow">
                <div className="input-icon-prefix">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
                <button type="button" className="input-action" onClick={() => { setShowForm(false); setNewTaskTitle(""); setNewTaskDescription(""); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="description-input-wrapper">
                <textarea
                  placeholder="Add a description (optional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setNewTaskTitle(""); setNewTaskDescription(""); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newTaskTitle.trim() || isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          ) : (
            <button className="add-task-btn" onClick={() => setShowForm(true)}>
              <div className="add-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span>Add New Task</span>
            </button>
          )}
        </div>

        {/* Tasks Container */}
        <div className="tasks-container animate-fade-in" style={{ animationDelay: "0.5s" }}>
          {/* Task Header */}
          <div className="tasks-header">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <span>All</span>
                <span className="tab-count">{todos.length}</span>
              </button>
              <button
                className={`tab ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                <span>Active</span>
                <span className="tab-count">{activeCount}</span>
              </button>
              <button
                className={`tab ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                <span>Completed</span>
                <span className="tab-count">{completedCount}</span>
              </button>
            </div>
            <div className="search-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tasks List */}
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {searchQuery ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                ) : activeTab === "completed" && completedCount === 0 ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                )}
              </div>
              <h3>
                {searchQuery
                  ? "No tasks found"
                  : activeTab === "completed" && completedCount === 0
                  ? "No completed tasks yet"
                  : "No tasks yet"}
              </h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search or filter"
                  : activeTab === "completed" && completedCount === 0
                  ? "Complete some tasks to see them here"
                  : "Add your first task to get started"}
              </p>
              {!searchQuery && activeTab !== "completed" && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Add Your First Task
                </button>
              )}
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo, index) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "completed" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    className={`checkbox ${todo.completed ? "checked" : ""}`}
                    onClick={() => handleToggleTodo(todo.id, !todo.completed)}
                  >
                    {todo.completed && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </button>
                  <div className="todo-content">
                    <span className="todo-title">{todo.title}</span>
                    {todo.description && (
                      <span className="todo-description">{todo.description}</span>
                    )}
                  </div>
                  <div className="todo-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => openEditModal(todo)}
                      title="Edit task"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this task?")) {
                          handleDeleteTodo(todo.id);
                        }
                      }}
                      title="Delete task"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingTodo && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="modal-close" onClick={closeEditModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Description (optional)</label>
                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!editTitle.trim() || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Ambient Background Glows */
        .ambient-glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(150px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        .ambient-glow-1 {
          width: 600px;
          height: 600px;
          background: var(--primary);
          top: -200px;
          right: -200px;
        }

        .ambient-glow-2 {
          width: 500px;
          height: 500px;
          background: var(--secondary);
          bottom: -150px;
          left: -150px;
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: var(--text-secondary);
        }

        .loading-spinner {
          position: relative;
          width: 48px;
          height: 48px;
          margin-bottom: 24px;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-ring::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 3px solid transparent;
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 1.2s linear infinite reverse;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Dashboard Header */
        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .header-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          display: flex;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        /* Dashboard Main */
        .dashboard-main {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        /* Alert */
        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: var(--danger-light);
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: var(--radius);
          margin-bottom: 24px;
          color: var(--danger);
        }

        .alert button {
          margin-left: auto;
          background: transparent;
          border: none;
          color: currentColor;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert button:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          position: relative;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          overflow: hidden;
        }

        .stat-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.total {
          background: var(--primary-light);
          color: var(--primary);
        }

        .stat-icon.active {
          background: var(--warning-light);
          color: var(--warning);
        }

        .stat-icon.completed {
          background: var(--success-light);
          color: var(--success);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        /* Task Input Section */
        .task-input-section {
          margin-bottom: 24px;
        }

        .add-task-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px 24px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .add-task-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }

        .add-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .task-form {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin-bottom: 16px;
          transition: var(--transition);
        }

        .input-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .input-icon-prefix {
          color: var(--text-muted);
          display: flex;
          flex-shrink: 0;
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          color: var(--text-primary);
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: var(--text-muted);
        }

        .input-action {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .input-action:hover {
          color: var(--text-primary);
          background: var(--bg-glass-hover);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Tasks Container */
        .tasks-container {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        /* Tasks Header */
        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-glass);
        }

        .tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
        }

        .tab:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .tab.active {
          background: var(--primary);
          color: white;
        }

        .tab-count {
          padding: 2px 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          font-size: 12px;
        }

        .tab:not(.active) .tab-count {
          background: var(--border);
          color: var(--text-secondary);
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          width: 240px;
        }

        .search-wrapper svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }

        .search-wrapper input::placeholder {
          color: var(--text-muted);
        }

        /* Todo List */
        .todo-list {
          list-style: none;
          padding: 0;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
          animation: fadeIn 0.3s ease forwards;
          opacity: 0;
        }

        .todo-item:last-child {
          border-bottom: none;
        }

        .todo-item:hover {
          background: var(--bg-glass-hover);
        }

        .todo-item:hover .todo-actions {
          opacity: 1;
        }

        .todo-item.completed .todo-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: var(--transition);
        }

        .checkbox:hover {
          border-color: var(--success);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .checkbox.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .todo-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .todo-title {
          font-size: 15px;
          color: var(--text-primary);
          word-break: break-word;
        }

        .todo-description {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .todo-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: var(--transition);
        }

        .action-btn {
          width: 34px;
          height: 34px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .action-btn:hover {
          background: var(--bg-glass);
        }

        .action-btn.edit:hover {
          color: var(--primary);
        }

        .action-btn.delete:hover {
          background: var(--danger-light);
          color: var(--danger);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-glass);
          border-radius: 50%;
          color: var(--text-muted);
        }

        .empty-state h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .empty-state p {
          font-size: 14px;
          margin-bottom: 24px;
        }

        /* Description Input */
        .description-input-wrapper {
          margin-bottom: 16px;
        }

        .description-input-wrapper textarea {
          width: 100%;
          padding: 14px 18px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 14px;
          font-family: inherit;
          color: var(--text-primary);
          resize: vertical;
          min-height: 60px;
          transition: var(--transition);
        }

        .description-input-wrapper textarea::placeholder {
          color: var(--text-muted);
        }

        .description-input-wrapper textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 480px;
          animation: slideUp 0.3s ease;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .modal-close:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body .form-group {
          margin-bottom: 20px;
        }

        .modal-body .form-group:last-child {
          margin-bottom: 0;
        }

        .modal-body label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .modal-body input,
        .modal-body textarea {
          width: 100%;
          padding: 14px 18px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 15px;
          font-family: inherit;
          color: var(--text-primary);
          transition: var(--transition);
        }

        .modal-body input::placeholder,
        .modal-body textarea::placeholder {
          color: var(--text-muted);
        }

        .modal-body input:focus,
        .modal-body textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .modal-body textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg-glass);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tasks-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .tabs {
            justify-content: center;
          }

          .search-wrapper {
            width: 100%;
          }

          .todo-actions {
            opacity: 1;
          }

          .todo-item {
            padding: 14px 16px;
          }

          .modal-content {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
