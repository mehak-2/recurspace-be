import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

const API_URL = import.meta.env.VITE_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL + "/api",
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set("authorization", token);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export interface Integration {
  enabled: boolean;
  connected: boolean;
  lastSync: string | null;
  provider?: string;
  syncDirection?: string;
  autoProcess?: boolean;
  workspace?: string;
  username?: string;
}

export interface Integrations {
  googleCalendar: Integration;
  gmail: Integration;
  slack: Integration;
  github: Integration;
  notion: Integration;
  trello: Integration;
}

export interface IntegrationStatus {
  enabled: boolean;
  connected: boolean;
  lastSync: string | null;
  health: "healthy" | "stale" | "disconnected";
}

export interface ConnectIntegrationRequest {
  credentials?: Record<string, string | number | boolean>;
  settings?: Record<string, string | number | boolean>;
}

export interface SyncIntegrationRequest {
  direction?: "bidirectional" | "import" | "export";
}

export const integrationsApi = createApi({
  reducerPath: "integrationsApi",
  baseQuery,
  tagTypes: ["Integration"],
  endpoints: (builder) => ({
    getIntegrations: builder.query<Integrations, void>({
      query: () => "/integrations",
      transformResponse: (response: {
        success: boolean;
        integrations: Integrations;
      }) => response.integrations,
      providesTags: ["Integration"],
    }),
    connectIntegration: builder.mutation<
      { message: string; integration: Integration },
      { integration: string; data: ConnectIntegrationRequest }
    >({
      query: ({ integration, data }) => ({
        url: `/integrations/${integration}/connect`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        integration: Integration;
      }) => ({
        message: response.message,
        integration: response.integration,
      }),
      invalidatesTags: ["Integration"],
    }),
    disconnectIntegration: builder.mutation<
      { message: string },
      { integration: string }
    >({
      query: ({ integration }) => ({
        url: `/integrations/${integration}/disconnect`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        message: response.message,
      }),
      invalidatesTags: ["Integration"],
    }),
    syncIntegration: builder.mutation<
      { message: string; lastSync: string },
      { integration: string; data: SyncIntegrationRequest }
    >({
      query: ({ integration, data }) => ({
        url: `/integrations/${integration}/sync`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        lastSync: string;
      }) => ({
        message: response.message,
        lastSync: response.lastSync,
      }),
      invalidatesTags: ["Integration"],
    }),
    getIntegrationStatus: builder.query<
      IntegrationStatus,
      { integration: string }
    >({
      query: ({ integration }) => `/integrations/${integration}/status`,
      transformResponse: (response: {
        success: boolean;
        status: IntegrationStatus;
      }) => response.status,
      providesTags: ["Integration"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation,
  useGetIntegrationStatusQuery,
} = integrationsApi;
