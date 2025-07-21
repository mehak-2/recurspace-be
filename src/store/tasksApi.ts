import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL + "/api",
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set("authorization", token);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  assignee?: string;
  estimatedTime?: number;
  actualTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  assignee?: string;
  estimatedTime?: number;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], { status?: string; search?: string }>({
      query: (params) => ({
        url: "/tasks",
        params,
      }),
      transformResponse: (response: { success: boolean; tasks: Task[] }) =>
        response.tasks,
      providesTags: ["Task"],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (task) => ({
        url: "/tasks",
        method: "POST",
        body: task,
      }),
      transformResponse: (response: { success: boolean; task: Task }) =>
        response.task,
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation<Task, { id: string; task: Partial<Task> }>({
      query: ({ id, task }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: task,
      }),
      transformResponse: (response: { success: boolean; task: Task }) =>
        response.task,
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
    completeTask: builder.mutation<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status: "completed" },
      }),
      transformResponse: (response: { success: boolean; task: Task }) =>
        response.task,
      invalidatesTags: ["Task"],
    }),
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: { success: boolean; task: Task }) =>
        response.task,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useGetTaskByIdQuery,
} = tasksApi;
