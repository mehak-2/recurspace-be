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

export interface OAuthUrls {
  google: {
    authUrl: string;
    scope: string;
  };
  github: {
    authUrl: string;
    scope: string;
  };
  googleCalendar: {
    authUrl: string;
    scope: string;
  };
  githubIntegration: {
    authUrl: string;
    scope: string;
  };
  slack: {
    authUrl: string;
    scope: string;
  };
}

export interface OAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  message?: string;
  integration?: {
    enabled: boolean;
    connected: boolean;
    lastSync: string;
    provider?: string;
    username?: string;
    workspace?: string;
  };
}

export const oauthApi = createApi({
  reducerPath: "oauthApi",
  baseQuery,
  tagTypes: ["OAuth"],
  endpoints: (builder) => ({
    getOAuthUrls: builder.query<OAuthUrls, void>({
      query: () => "/oauth/urls",
      transformResponse: (response: { success: boolean; urls: OAuthUrls }) =>
        response.urls,
    }),
    googleAuth: builder.query<OAuthResponse, { code: string }>({
      query: ({ code }) => `/oauth/auth/google?code=${code}`,
      transformResponse: (response: OAuthResponse) => response,
    }),
    githubAuth: builder.query<OAuthResponse, { code: string }>({
      query: ({ code }) => `/oauth/auth/github?code=${code}`,
      transformResponse: (response: OAuthResponse) => response,
    }),
    googleCalendarAuth: builder.query<OAuthResponse, { code: string }>({
      query: ({ code }) => `/oauth/integrations/google-calendar?code=${code}`,
      transformResponse: (response: OAuthResponse) => response,
    }),
    githubIntegrationAuth: builder.query<OAuthResponse, { code: string }>({
      query: ({ code }) => `/oauth/integrations/github?code=${code}`,
      transformResponse: (response: OAuthResponse) => response,
    }),
    slackIntegrationAuth: builder.query<OAuthResponse, { code: string }>({
      query: ({ code }) => `/oauth/integrations/slack?code=${code}`,
      transformResponse: (response: OAuthResponse) => response,
    }),
  }),
});

export const {
  useGetOAuthUrlsQuery,
  useLazyGoogleAuthQuery,
  useLazyGithubAuthQuery,
  useLazyGoogleCalendarAuthQuery,
  useLazyGithubIntegrationAuthQuery,
  useLazySlackIntegrationAuthQuery,
} = oauthApi;
