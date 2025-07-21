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

export interface EfficiencyMetrics {
  timeSaved: number;
  tasksAutomated: number;
  efficiencyScore: number;
  revenuePerHour: number;
}

export interface ProductivityTrend {
  day: string;
  efficiency: number;
  tasks: number;
  timeActual: number;
  timeProjected: number;
}

export interface TimeAnalysis {
  timeWorked: number;
  timeProjected: number;
  efficiencyVsTarget: number;
  timeDistribution: {
    clientWork: number;
    adminTasks: number;
    learning: number;
  };
}

export interface ClientProductivity {
  client: string;
  tasks: number;
  timeSpent: string;
  efficiency: number;
  revenue: string;
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  color: string;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  color: string;
}

export interface DashboardAnalytics {
  efficiencyMetrics: EfficiencyMetrics;
  productivityTrends: ProductivityTrend[];
  timeAnalysis: TimeAnalysis;
  clientProductivity: ClientProductivity[];
  insights: Insight[];
  recommendations: Recommendation[];
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery,
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query<
      DashboardAnalytics,
      { timeframe?: string }
    >({
      query: (params) => ({
        url: "/analytics/dashboard",
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        data: DashboardAnalytics;
      }) => response.data,
      providesTags: ["Analytics"],
    }),
    generateAnalytics: builder.mutation<
      unknown,
      { type: string; period?: string; startDate?: string; endDate?: string }
    >({
      query: (analytics) => ({
        url: "/analytics/generate",
        method: "POST",
        body: analytics,
      }),
      invalidatesTags: ["Analytics"],
    }),
    getAnalytics: builder.query<
      unknown,
      { type?: string; metric?: string; period?: string }
    >({
      query: (params) => ({
        url: "/analytics",
        params,
      }),
      transformResponse: (response: { success: boolean; analytics: unknown }) =>
        response.analytics,
      providesTags: ["Analytics"],
    }),
    getAnalyticsSummary: builder.query<
      unknown,
      { period?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: "/analytics/summary",
        params,
      }),
      transformResponse: (response: { success: boolean; summary: unknown }) =>
        response.summary,
      providesTags: ["Analytics"],
    }),
    getAnalyticsChart: builder.query<
      unknown | undefined,
      { type?: string; metric?: string; period?: string }
    >({
      query: (params) => ({
        url: "/analytics/chart",
        params,
      }),
      transformResponse: (response: { success: boolean; chartData: unknown }) =>
        response.chartData,
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGenerateAnalyticsMutation,
  useGetAnalyticsQuery,
  useGetAnalyticsSummaryQuery,
  useGetAnalyticsChartQuery,
} = analyticsApi;
