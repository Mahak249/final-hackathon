import { Todo } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth && typeof window !== "undefined") {
    // 1. Try Cookie
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("access_token="));
    let token = authCookie ? authCookie.trim().split("=")[1] : null;

    // 2. Fallback to LocalStorage
    if (!token) {
      token = localStorage.getItem("access_token");
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || `HTTP ${response.status}`,
      response.status
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string }) =>
      request<{ id: string; email: string; created_at: string }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify(data),
          requiresAuth: false,
        }
      ),

    signin: (data: { email: string; password: string }) =>
      request<{
        access_token: string;
        token_type: string;
        user: { id: string; email: string; created_at: string };
      }>("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: false,
      }),

    signout: () =>
      request<{ message: string }>("/api/auth/signout", {
        method: "POST",
        requiresAuth: true,
      }),

    me: () =>
      request<{ id: string; email: string; created_at: string }>(
        "/api/auth/me",
        { requiresAuth: true }
      ),
  },

  todos: {
    list: () =>
      request<{ todos: Todo[]; total: number }>("/api/todos", {
        requiresAuth: true,
      }),

    get: (id: string) =>
      request<Todo>(`/api/todos/${id}`, { requiresAuth: true }),

    create: (data: { title: string; description?: string }) =>
      request<Todo>("/api/todos", {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      }),

    update: (id: string, data: { title?: string; description?: string }) =>
      request<Todo>(`/api/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        requiresAuth: true,
      }),

    delete: (id: string) =>
      request<void>(`/api/todos/${id}`, {
        method: "DELETE",
        requiresAuth: true,
      }),

    toggle: (id: string, completed: boolean) =>
      request<Todo>(`/api/todos/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
        requiresAuth: true,
      }),
  },
};

export type { ApiError };
