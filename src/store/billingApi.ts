import { api } from "./api";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    name: string;
    email?: string;
    company?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  paymentMethod: "credit_card" | "bank_transfer" | "paypal" | "check" | "cash";
  recurring: {
    isRecurring: boolean;
    frequency?: "weekly" | "bi_weekly" | "monthly" | "quarterly" | "yearly";
    nextBillingDate?: string;
    endDate?: string;
  };
  notes?: string;
  terms?: string;
  metadata?: {
    tags?: string[];
    category?: string;
    project?: string;
  };
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringBilling {
  _id: string;
  name: string;
  description?: string;
  client: {
    name: string;
    email?: string;
    company?: string;
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total: number;
  frequency: "weekly" | "bi_weekly" | "monthly" | "quarterly" | "yearly";
  status: "active" | "paused" | "cancelled";
  startDate: string;
  nextBillingDate: string;
  endDate?: string;
  autoGenerate: boolean;
  paymentMethod: "credit_card" | "bank_transfer" | "paypal";
  metadata?: {
    tags?: string[];
    category?: string;
  };
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingAnalytics {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  collectionRate: number;
  recurringRevenue: number;
  monthlyTrend: Array<{
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
    count: number;
  }>;
  statusDistribution: Record<string, number>;
  averageInvoiceValue: number;
}

export interface BillingOverview {
  recentInvoices: Invoice[];
  recentRecurringBilling: RecurringBilling[];
  totalRevenue: number;
  upcomingPayments: Invoice[];
  totalUpcomingAmount: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CreateInvoiceRequest {
  client: {
    name: string;
    email?: string;
    company?: string;
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount?: number;
  }>;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  dueDate: string;
  notes?: string;
  terms?: string;
}

export interface CreateRecurringBillingRequest {
  name: string;
  description?: string;
  client: {
    name: string;
    email?: string;
    company?: string;
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount?: number;
  }>;
  total?: number;
  frequency: "weekly" | "bi_weekly" | "monthly" | "quarterly" | "yearly";
  startDate: string;
  nextBillingDate: string;
  paymentMethod?: "credit_card" | "bank_transfer" | "paypal";
}

export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBillingOverview: builder.query<BillingOverview, void>({
      query: () => "/billing/overview",
      providesTags: ["BillingAnalytics"],
    }),

    getBillingAnalytics: builder.query<BillingAnalytics, { period?: string }>({
      query: (params) => ({
        url: "/billing/analytics",
        params,
      }),
      providesTags: ["BillingAnalytics"],
    }),

    getInvoices: builder.query<
      { invoices: Invoice[]; pagination: PaginationInfo },
      { status?: string; search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/billing/invoices",
        params,
      }),
      providesTags: ["Invoice"],
    }),

    getInvoice: builder.query<Invoice, string>({
      query: (id) => `/billing/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (invoiceData) => ({
        url: "/billing/invoices",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: ["Invoice", "BillingAnalytics"],
    }),

    updateInvoice: builder.mutation<
      Invoice,
      { id: string; data: Partial<Invoice> }
    >({
      query: ({ id, data }) => ({
        url: `/billing/invoices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Invoice",
        "BillingAnalytics",
      ],
    }),

    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/billing/invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice", "BillingAnalytics"],
    }),

    getRecurringBilling: builder.query<
      { recurringBillings: RecurringBilling[]; pagination: PaginationInfo },
      { status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/billing/recurring",
        params,
      }),
      providesTags: ["RecurringBilling"],
    }),

    createRecurringBilling: builder.mutation<
      RecurringBilling,
      CreateRecurringBillingRequest
    >({
      query: (billingData) => ({
        url: "/billing/recurring",
        method: "POST",
        body: billingData,
      }),
      invalidatesTags: ["RecurringBilling", "BillingAnalytics"],
    }),

    updateRecurringBilling: builder.mutation<
      RecurringBilling,
      { id: string; data: Partial<RecurringBilling> }
    >({
      query: ({ id, data }) => ({
        url: `/billing/recurring/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RecurringBilling", id },
        "RecurringBilling",
        "BillingAnalytics",
      ],
    }),

    deleteRecurringBilling: builder.mutation<void, string>({
      query: (id) => ({
        url: `/billing/recurring/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RecurringBilling", "BillingAnalytics"],
    }),

    generateInvoice: builder.mutation<Invoice, string>({
      query: (recurringBillingId) => ({
        url: `/billing/recurring/${recurringBillingId}/generate-invoice`,
        method: "POST",
      }),
      invalidatesTags: ["Invoice", "RecurringBilling", "BillingAnalytics"],
    }),
  }),
});

export const {
  useGetBillingOverviewQuery,
  useGetBillingAnalyticsQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetRecurringBillingQuery,
  useCreateRecurringBillingMutation,
  useUpdateRecurringBillingMutation,
  useDeleteRecurringBillingMutation,
  useGenerateInvoiceMutation,
} = billingApi;
