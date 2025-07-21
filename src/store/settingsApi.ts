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

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  company?: string;
  timezone?: string;
  workHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
  subscription?: {
    plan: string;
    price: string;
    period: string;
    status: string;
    nextBilling?: string;
  };
  paymentMethod?: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
  };
  apiKey?: string;
}

export interface UserSettings {
  _id: string;
  user: string;
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
    billing: boolean;
  };
  integrations: {
    googleCalendar: boolean;
    gmail: boolean;
    slack: boolean;
    github: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

export interface BillingInfo {
  currentPlan: {
    name: string;
    price: string;
    period: string;
    status: string;
    nextBilling?: string;
  };
  billingHistory: Array<{
    _id: string;
    date: string;
    amount: string;
    status: string;
  }>;
  paymentMethod?: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  status: string;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery,
  tagTypes: ["Settings", "Profile", "Billing"],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/settings/profile",
      transformResponse: (response: { success: boolean; user: UserProfile }) =>
        response.user,
      providesTags: ["Profile"],
    }),
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (profile) => ({
        url: "/settings/profile",
        method: "PUT",
        body: profile,
      }),
      transformResponse: (response: { success: boolean; user: UserProfile }) =>
        response.user,
      invalidatesTags: ["Profile"],
      // Add optimistic update
      async onQueryStarted(profile, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          settingsApi.util.updateQueryData(
            "getUserProfile",
            undefined,
            (draft) => {
              Object.assign(draft, profile);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getUserSettings: builder.query<UserSettings, void>({
      query: () => "/settings/settings",
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      providesTags: ["Settings"],
    }),
    updateUserSettings: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (settings) => ({
        url: "/settings/settings",
        method: "PUT",
        body: settings,
      }),
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      invalidatesTags: ["Settings"],
    }),
    getBillingInfo: builder.query<BillingInfo, void>({
      query: () => "/settings/billing",
      transformResponse: (response: {
        success: boolean;
        billing: BillingInfo;
      }) => response.billing,
      providesTags: ["Billing"],
    }),
    updatePaymentMethod: builder.mutation<
      UserProfile,
      { paymentMethod: unknown }
    >({
      query: (data) => ({
        url: "/settings/billing/payment-method",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { success: boolean; user: UserProfile }) =>
        response.user,
      invalidatesTags: ["Billing", "Profile"],
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (passwords) => ({
        url: "/settings/password",
        method: "PUT",
        body: passwords,
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
    }),
    enableTwoFactor: builder.mutation<UserSettings, void>({
      query: () => ({
        url: "/settings/2fa/enable",
        method: "POST",
      }),
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      invalidatesTags: ["Settings"],
    }),
    disableTwoFactor: builder.mutation<UserSettings, void>({
      query: () => ({
        url: "/settings/2fa/disable",
        method: "POST",
      }),
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      invalidatesTags: ["Settings"],
    }),
    getActiveSessions: builder.query<Session[], void>({
      query: () => "/settings/sessions",
      transformResponse: (response: {
        success: boolean;
        sessions: Session[];
      }) => response.sessions,
    }),
    revokeSession: builder.mutation<{ message: string }, string>({
      query: (sessionId) => ({
        url: `/settings/sessions/${sessionId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
    }),
    revokeAllSessions: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/settings/sessions",
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) =>
        response,
    }),
    connectIntegration: builder.mutation<
      UserSettings,
      { integration: string; credentials?: unknown }
    >({
      query: ({ integration, credentials }) => ({
        url: `/settings/integrations/${integration}/connect`,
        method: "POST",
        body: { credentials },
      }),
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      invalidatesTags: ["Settings"],
    }),
    disconnectIntegration: builder.mutation<UserSettings, string>({
      query: (integration) => ({
        url: `/settings/integrations/${integration}/disconnect`,
        method: "POST",
      }),
      transformResponse: (response: {
        success: boolean;
        settings: UserSettings;
      }) => response.settings,
      invalidatesTags: ["Settings"],
    }),
    generateApiKey: builder.mutation<{ apiKey: string }, void>({
      query: () => ({
        url: "/settings/api-key/generate",
        method: "POST",
      }),
      transformResponse: (response: { success: boolean; apiKey: string }) =>
        response,
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetBillingInfoQuery,
  useUpdatePaymentMethodMutation,
  useChangePasswordMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
  useGenerateApiKeyMutation,
} = settingsApi;
