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

export interface TwoFactorAuth {
  enabled: boolean;
  method: "authenticator" | "sms" | "email";
  backupCodes: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  status: "active" | "inactive";
  ipAddress: string;
  userAgent: string;
}

export interface LoginHistory {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  status: "success" | "failed";
  ipAddress: string;
  userAgent: string;
}

export interface SecuritySettings {
  twoFactorAuth: TwoFactorAuth;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  loginHistory: LoginHistory[];
  activeSessions: Session[];
}

export interface UpdateSecuritySettingsRequest {
  twoFactorAuth?: Partial<TwoFactorAuth>;
  sessionTimeout?: number;
  passwordPolicy?: Partial<PasswordPolicy>;
}

export interface EnableTwoFactorRequest {
  method?: "authenticator" | "sms" | "email";
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const securityApi = createApi({
  reducerPath: "securityApi",
  baseQuery,
  tagTypes: ["Security"],
  endpoints: (builder) => ({
    getSecuritySettings: builder.query<SecuritySettings, void>({
      query: () => "/security/settings",
      transformResponse: (response: {
        success: boolean;
        security: SecuritySettings;
      }) => response.security,
      providesTags: ["Security"],
    }),
    updateSecuritySettings: builder.mutation<
      { message: string; security: SecuritySettings },
      UpdateSecuritySettingsRequest
    >({
      query: (data) => ({
        url: "/security/settings",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        security: SecuritySettings;
      }) => ({
        message: response.message,
        security: response.security,
      }),
      invalidatesTags: ["Security"],
    }),
    enableTwoFactorAuth: builder.mutation<
      { message: string; backupCodes: string[]; qrCode: string },
      EnableTwoFactorRequest
    >({
      query: (data) => ({
        url: "/security/2fa/enable",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        backupCodes: string[];
        qrCode: string;
      }) => ({
        message: response.message,
        backupCodes: response.backupCodes,
        qrCode: response.qrCode,
      }),
      invalidatesTags: ["Security"],
    }),
    disableTwoFactorAuth: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/security/2fa/disable",
        method: "POST",
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        message: response.message,
      }),
      invalidatesTags: ["Security"],
    }),
    getActiveSessions: builder.query<Session[], void>({
      query: () => "/security/sessions",
      transformResponse: (response: {
        success: boolean;
        sessions: Session[];
      }) => response.sessions,
      providesTags: ["Security"],
    }),
    revokeSession: builder.mutation<{ message: string }, { sessionId: string }>(
      {
        query: ({ sessionId }) => ({
          url: `/security/sessions/${sessionId}`,
          method: "DELETE",
        }),
        transformResponse: (response: {
          success: boolean;
          message: string;
        }) => ({
          message: response.message,
        }),
        invalidatesTags: ["Security"],
      }
    ),
    revokeAllSessions: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/security/sessions",
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        message: response.message,
      }),
      invalidatesTags: ["Security"],
    }),
    getLoginHistory: builder.query<LoginHistory[], void>({
      query: () => "/security/login-history",
      transformResponse: (response: {
        success: boolean;
        loginHistory: LoginHistory[];
      }) => response.loginHistory,
      providesTags: ["Security"],
    }),
    generateApiKey: builder.mutation<{ apiKey: string }, void>({
      query: () => ({
        url: "/security/api-key/generate",
        method: "POST",
      }),
      transformResponse: (response: { success: boolean; apiKey: string }) => ({
        apiKey: response.apiKey,
      }),
      invalidatesTags: ["Security"],
    }),
    revokeApiKey: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/security/api-key",
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        message: response.message,
      }),
      invalidatesTags: ["Security"],
    }),
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/security/change-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        message: response.message,
      }),
      invalidatesTags: ["Security"],
    }),
  }),
});

export const {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useEnableTwoFactorAuthMutation,
  useDisableTwoFactorAuthMutation,
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetLoginHistoryQuery,
  useGenerateApiKeyMutation,
  useRevokeApiKeyMutation,
  useChangePasswordMutation,
} = securityApi;
