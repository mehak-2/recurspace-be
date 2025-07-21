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

export interface AIOptimization {
  _id: string;
  user: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  status: "pending" | "applied" | "rejected";
  confidence: number;
  estimatedSavings: {
    time: number;
    efficiency: number;
  };
  implementation: {
    steps: string[];
    requirements: string[];
    estimatedTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationStats {
  byStatus: Array<{ _id: string; count: number }>;
  byType: Array<{ _id: string; count: number }>;
  byImpact: Array<{ _id: string; count: number }>;
  total: number;
  applied: number;
  applicationRate: string;
  totalSavings: {
    time: number;
    efficiency: number;
  };
}

export interface Pattern {
  pattern: string;
  frequency: string;
  impact: string;
  recommendation: string;
  confidence: number;
  category: string;
}

export interface PatternAnalysis {
  patterns: Pattern[];
  summary: {
    totalPatterns: number;
    highImpactPatterns: number;
    averageConfidence: string;
  };
}

export interface AutomationRule {
  _id: string;
  name: string;
  condition: {
    field: string;
    operator: string;
    value: string | number | boolean | Date | null;
  };
  action: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const aiOptimizerApi = createApi({
  reducerPath: "aiOptimizerApi",
  baseQuery,
  tagTypes: ["AIOptimization", "Pattern", "Rule"],
  endpoints: (builder) => ({
    getAIOptimizations: builder.query<AIOptimization[], void>({
      query: () => "/ai-optimizer",
      transformResponse: (response: {
        success: boolean;
        optimizations: AIOptimization[];
      }) => response.optimizations,
      providesTags: ["AIOptimization"],
    }),
    getAIOptimizationStats: builder.query<OptimizationStats, void>({
      query: () => "/ai-optimizer/stats",
      transformResponse: (response: {
        success: boolean;
        stats: OptimizationStats;
      }) => response.stats,
    }),
    getAIOptimizationPatterns: builder.query<PatternAnalysis, void>({
      query: () => "/ai-optimizer/patterns",
      transformResponse: (response: {
        success: boolean;
        patterns: Pattern[];
        summary: PatternAnalysis["summary"];
      }) => ({
        patterns: response.patterns,
        summary: response.summary,
      }),
      providesTags: ["Pattern"],
    }),
    getAIOptimizationRules: builder.query<{ rules: AutomationRule[] }, void>({
      query: () => "/ai-optimizer/rules",
      providesTags: ["Rule"],
    }),
    generateAIOptimizations: builder.mutation<
      AIOptimization[],
      { type: string }
    >({
      query: (body) => ({
        url: "/ai-optimizer/generate",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        success: boolean;
        optimizations: AIOptimization[];
      }) => response.optimizations,
      invalidatesTags: ["AIOptimization"],
    }),
    updateAIOptimizationStatus: builder.mutation<
      AIOptimization,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/ai-optimizer/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: {
        success: boolean;
        optimization: AIOptimization;
      }) => response.optimization,
      invalidatesTags: ["AIOptimization"],
    }),
    createAutomationRule: builder.mutation<
      AutomationRule,
      { pattern: string; name: string; action: string }
    >({
      query: (body) => ({
        url: "/ai-optimizer/rules",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        success: boolean;
        rule: AutomationRule;
      }) => response.rule,
      invalidatesTags: ["Rule"],
    }),
  }),
});

export const {
  useGetAIOptimizationsQuery,
  useGetAIOptimizationStatsQuery,
  useGetAIOptimizationPatternsQuery,
  useGetAIOptimizationRulesQuery,
  useGenerateAIOptimizationsMutation,
  useUpdateAIOptimizationStatusMutation,
  useCreateAutomationRuleMutation,
} = aiOptimizerApi;
