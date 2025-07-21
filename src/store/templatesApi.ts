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

export interface Variable {
  name: string;
  description?: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface Template {
  _id: string;
  user: string;
  name: string;
  description: string;
  type: "task" | "workflow" | "email" | "document" | "report" | "automation";
  category:
    | "business"
    | "personal"
    | "project"
    | "communication"
    | "reporting"
    | "automation";
  content: string;
  variables: Variable[];
  metadata: {
    estimatedTime: number;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
    version: string;
  };
  automation: {
    enabled: boolean;
    triggers: string[];
    conditions: string[];
    actions: string[];
  };
  usage: {
    totalUses: number;
    successRate: number;
    lastUsed?: string;
  };
  permissions: {
    isPublic: boolean;
    allowDuplication: boolean;
    allowModification: boolean;
  };
  status: "draft" | "published" | "archived";
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateStats {
  totalTemplates: number;
  totalUsage: number;
  timeSaved: number;
  mostUsed: string;
}

export const templatesApi = createApi({
  reducerPath: "templatesApi",
  baseQuery,
  tagTypes: ["Template"],
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], void>({
      query: () => "/templates",
      transformResponse: (response: {
        success: boolean;
        templates: Template[];
      }) => response.templates,
      providesTags: ["Template"],
    }),
    getTemplateStats: builder.query<TemplateStats, void>({
      query: () => "/templates/stats",
      // If stats are wrapped, you can add transformResponse here too
    }),
    createTemplate: builder.mutation<
      Template,
      Omit<Template, "_id" | "user" | "createdAt" | "updatedAt">
    >({
      query: (template) => ({
        url: "/templates",
        method: "POST",
        body: template,
      }),
      transformResponse: (response: { success: boolean; template: Template }) =>
        response.template,
      invalidatesTags: ["Template"],
    }),
    updateTemplate: builder.mutation<
      Template,
      { id: string; template: Partial<Template> }
    >({
      query: ({ id, template }) => ({
        url: `/templates/${id}`,
        method: "PUT",
        body: template,
      }),
      invalidatesTags: ["Template"],
    }),
    deleteTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Template"],
    }),
    duplicateTemplate: builder.mutation<Template, string>({
      query: (id) => ({
        url: `/templates/${id}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: ["Template"],
    }),
    executeTemplate: builder.mutation<
      unknown,
      { id: string; variables: Record<string, string> }
    >({
      query: ({ id, variables }) => ({
        url: `/templates/${id}/execute`,
        method: "POST",
        body: { variables },
      }),
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateStatsQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
  useExecuteTemplateMutation,
} = templatesApi;
