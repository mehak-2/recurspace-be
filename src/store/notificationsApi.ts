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

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "task"
    | "workflow"
    | "billing"
    | "system";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  weekly: boolean;
  billing: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery,
  tagTypes: ["Notification", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      { page?: number; limit?: number; unreadOnly?: boolean }
    >({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      transformResponse: (response: NotificationsResponse) => response,
      providesTags: (result) =>
        result
          ? [
              ...result.notifications.map(({ _id }) => ({
                type: "Notification" as const,
                id: _id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: UnreadCountResponse) => response,
      providesTags: ["UnreadCount"],
    }),
    createNotification: builder.mutation<
      { success: boolean; notification: Notification },
      {
        title: string;
        message: string;
        type?: Notification["type"];
        priority?: Notification["priority"];
        actionUrl?: string;
        metadata?: Record<string, unknown>;
      }
    >({
      query: (notification) => ({
        url: "/notifications",
        method: "POST",
        body: notification,
      }),
      transformResponse: (response: {
        success: boolean;
        notification: Notification;
      }) => response,
      invalidatesTags: ["Notification", "UnreadCount"],
    }),
    markAsRead: builder.mutation<
      { success: boolean; notification: Notification },
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      transformResponse: (response: {
        success: boolean;
        notification: Notification;
      }) => response,
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        "UnreadCount",
      ],
    }),
    markAllAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PUT",
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
      invalidatesTags: ["Notification", "UnreadCount"],
    }),
    deleteNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        "UnreadCount",
      ],
    }),
    deleteAllNotifications: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/notifications",
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
      invalidatesTags: ["Notification", "UnreadCount"],
    }),
    updateNotificationPreferences: builder.mutation<
      { success: boolean; notificationPreferences: NotificationPreferences },
      NotificationPreferences
    >({
      query: (preferences) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body: preferences,
      }),
      transformResponse: (response: {
        success: boolean;
        notificationPreferences: NotificationPreferences;
      }) => response,
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
