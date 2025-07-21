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

export interface WorkflowStep {
  _id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
  assignee?: string;
  completedAt?: string;
}

export interface WorkflowAutomation {
  enabled: boolean;
  triggers: string[];
  conditions: string[];
  actions: string[];
}

export interface WorkflowMetrics {
  totalSteps: number;
  completedSteps: number;
  totalTime: number;
  averageStepTime: number;
  efficiency: number;
  completionRate: number;
}

export interface WorkflowCollaborator {
  user: string;
  role: "owner" | "editor" | "viewer";
  addedAt: string;
}

export interface Workflow {
  _id: string;
  user: string;
  name: string;
  description: string;
  type: "manual" | "automated" | "scheduled" | "triggered";
  frequency: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "active"
    | "paused"
    | "completed"
    | "cancelled"
    | "optimizing"
    | "needs_attention";
  startDate: string;
  dueDate?: string;
  steps: WorkflowStep[];
  currentStep: number;
  progress: number;
  automation: WorkflowAutomation;
  metrics: WorkflowMetrics;
  collaborators: WorkflowCollaborator[];
  clients: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStats {
  activeWorkflows: number;
  totalTimeSaved: number;
  avgCompletion: number;
  opportunities: number;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  type: "manual" | "automated" | "scheduled" | "triggered";
  frequency: string;
  priority: "low" | "medium" | "high" | "urgent";
  status?: string;
  startDate?: string;
  dueDate?: string;
  steps?: WorkflowStep[];
  currentStep?: number;
  progress?: number;
  automation?: WorkflowAutomation;
  metrics?: WorkflowMetrics;
  collaborators?: WorkflowCollaborator[];
  clients?: string[];
  tags?: string[];
}

export const workflowsApi = createApi({
  reducerPath: "workflowsApi",
  baseQuery,
  tagTypes: ["Workflow", "WorkflowStats"],
  endpoints: (builder) => ({
    getWorkflows: builder.query<
      Workflow[],
      { status?: string; search?: string }
    >({
      query: (params) => ({
        url: "/workflows",
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        workflows: Workflow[];
      }) => response.workflows,
      providesTags: ["Workflow"],
    }),
    getWorkflowStats: builder.query<WorkflowStats, void>({
      query: () => "/workflows/tracker-stats",
      transformResponse: (response: {
        success: boolean;
        stats: WorkflowStats;
      }) => response.stats,
      providesTags: ["WorkflowStats"],
    }),
    createWorkflow: builder.mutation<Workflow, CreateWorkflowRequest>({
      query: (workflow) => ({
        url: "/workflows",
        method: "POST",
        body: workflow,
      }),
      transformResponse: (response: { success: boolean; workflow: Workflow }) =>
        response.workflow,
      invalidatesTags: ["Workflow", "WorkflowStats"],
    }),
    updateWorkflow: builder.mutation<
      Workflow,
      { id: string; workflow: Partial<Workflow> }
    >({
      query: ({ id, workflow }) => ({
        url: `/workflows/${id}`,
        method: "PUT",
        body: workflow,
      }),
      transformResponse: (response: { success: boolean; workflow: Workflow }) =>
        response.workflow,
      invalidatesTags: ["Workflow", "WorkflowStats"],
    }),
    deleteWorkflow: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workflows/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workflow", "WorkflowStats"],
    }),
    getWorkflowById: builder.query<Workflow, string>({
      query: (id) => `/workflows/${id}`,
      transformResponse: (response: { success: boolean; workflow: Workflow }) =>
        response.workflow,
      providesTags: (result, error, id) => [{ type: "Workflow", id }],
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useGetWorkflowStatsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowByIdQuery,
} = workflowsApi;
