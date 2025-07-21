import React, { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  Plus,
  Filter,
  Search,
  Loader2,
  X,
  Trash2,
} from "lucide-react";
import {
  useGetBillingOverviewQuery,
  useGetBillingAnalyticsQuery,
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetRecurringBillingQuery,
  useCreateRecurringBillingMutation,
  useUpdateRecurringBillingMutation,
  useDeleteRecurringBillingMutation,
} from "../store/billingApi";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoiceData: any) => Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface CreateRecurringBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (billingData: any) => Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    client: { name: "", email: "", company: "" },
    services: [{ name: "", description: "", quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    dueDate: "",
    notes: "",
    terms: "",
  });
  const [loading, setLoading] = useState(false);

  const calculateTotals = () => {
    const subtotal = formData.services.reduce(
      (sum, service) => sum + service.amount,
      0
    );
    const total = subtotal + formData.tax - formData.discount;
    setFormData((prev) => ({ ...prev, subtotal, total }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.services, formData.tax, formData.discount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.client.name) {
      alert("Client name is required");
      return;
    }

    if (!formData.dueDate) {
      alert("Due date is required");
      return;
    }

    if (formData.services.length === 0) {
      alert("At least one service is required");
      return;
    }

    // Validate services
    for (let i = 0; i < formData.services.length; i++) {
      const service = formData.services[i];
      if (!service.name) {
        alert(`Service ${i + 1} name is required`);
        return;
      }
      if (service.rate <= 0) {
        alert(`Service ${i + 1} rate must be greater than 0`);
        return;
      }
    }

    try {
      setLoading(true);
      console.log("Submitting invoice data:", formData);
      await onCreate(formData);
      setFormData({
        client: { name: "", email: "", company: "" },
        services: [
          { name: "", description: "", quantity: 1, rate: 0, amount: 0 },
        ],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        dueDate: "",
        notes: "",
        terms: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please check all required fields.");
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { name: "", description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateService = (
    index: number,
    field: string,
    value: number | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service, i) => {
        if (i === index) {
          const updated = { ...service, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return service;
      }),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client: { ...prev.client, name: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={formData.client.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client: { ...prev.client, email: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.client.company}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  client: { ...prev.client, company: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              <button
                type="button"
                onClick={addService}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Service
              </button>
            </div>
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Service name"
                      value={service.name}
                      onChange={(e) =>
                        updateService(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={service.quantity}
                      onChange={(e) =>
                        updateService(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={service.rate}
                      onChange={(e) =>
                        updateService(
                          index,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1">
                    <span className="block px-3 py-2 text-gray-900 font-medium">
                      ${service.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax
              </label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tax: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <span className="block px-3 py-2 bg-gray-100 rounded-md text-gray-900 font-bold">
                ${formData.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Invoice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateRecurringBillingModal({
  isOpen,
  onClose,
  onCreate,
}: CreateRecurringBillingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: { name: "", email: "", company: "" },
    services: [{ name: "", description: "", quantity: 1, rate: 0, amount: 0 }],
    total: 0,
    frequency: "monthly" as
      | "weekly"
      | "bi_weekly"
      | "monthly"
      | "quarterly"
      | "yearly",
    startDate: "",
    nextBillingDate: "",
    paymentMethod: "credit_card" as const,
  });
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const total = formData.services.reduce(
      (sum, service) => sum + service.amount,
      0
    );
    setFormData((prev) => ({ ...prev, total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.client.name ||
      formData.services.length === 0
    )
      return;

    try {
      setLoading(true);
      await onCreate(formData);
      setFormData({
        name: "",
        description: "",
        client: { name: "", email: "", company: "" },
        services: [
          { name: "", description: "", quantity: 1, rate: 0, amount: 0 },
        ],
        total: 0,
        frequency: "monthly" as
          | "weekly"
          | "bi_weekly"
          | "monthly"
          | "quarterly"
          | "yearly",
        startDate: "",
        nextBillingDate: "",
        paymentMethod: "credit_card" as const,
      });
      onClose();
    } catch (error) {
      console.error("Error creating recurring billing:", error);
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { name: "", description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateService = (
    index: number,
    field: string,
    value: number | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service, i) => {
        if (i === index) {
          const updated = { ...service, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return service;
      }),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Recurring Billing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    frequency: e.target.value as
                      | "weekly"
                      | "bi_weekly"
                      | "monthly"
                      | "quarterly"
                      | "yearly",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client: { ...prev.client, name: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={formData.client.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client: { ...prev.client, email: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Billing Date
              </label>
              <input
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nextBillingDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              <button
                type="button"
                onClick={addService}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Service
              </button>
            </div>
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Service name"
                      value={service.name}
                      onChange={(e) =>
                        updateService(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={service.quantity}
                      onChange={(e) =>
                        updateService(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={service.rate}
                      onChange={(e) =>
                        updateService(
                          index,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1">
                    <span className="block px-3 py-2 text-gray-900 font-medium">
                      ${service.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Recurring Billing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Billing() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // RTK Query hooks
  const { isLoading: overviewLoading, error: overviewError } =
    useGetBillingOverviewQuery();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useGetBillingAnalyticsQuery({ period: "month" });
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useGetInvoicesQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });
  const {
    data: recurringData,
    isLoading: recurringLoading,
    error: recurringError,
  } = useGetRecurringBillingQuery({});

  // Mutations
  const [createInvoice] = useCreateInvoiceMutation();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [createRecurringBilling] = useCreateRecurringBillingMutation();
  const [updateRecurringBilling] = useUpdateRecurringBillingMutation();
  const [deleteRecurringBilling] = useDeleteRecurringBillingMutation();

  const invoices = invoicesData?.invoices || [];
  const recurringBilling = recurringData?.recurringBillings || [];
  const loading =
    overviewLoading || analyticsLoading || invoicesLoading || recurringLoading;

  const handleCreateInvoice = async (
    invoiceData: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    try {
      await createInvoice(invoiceData).unwrap();
    } catch (err: unknown) {
      console.error("Invoice creation error:", err);
      throw err;
    }
  };

  const handleCreateRecurringBilling = async (
    billingData: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    await createRecurringBilling(billingData).unwrap();
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId).unwrap();
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const handleDeleteRecurringBilling = async (billingId: string) => {
    try {
      await deleteRecurringBilling(billingId).unwrap();
    } catch (err) {
      console.error("Error deleting recurring billing:", err);
    }
  };

  const handleUpdateRecurringBilling = async (
    billingId: string,
    status: "active" | "paused" | "cancelled"
  ) => {
    try {
      await updateRecurringBilling({
        id: billingId,
        data: { status },
      }).unwrap();
    } catch (err) {
      console.error("Error updating recurring billing:", err);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paused":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (overviewError || analyticsError || invoicesError || recurringError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load billing data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Micro-Billing</h1>
          <p className="text-gray-600 mt-1">
            Manage recurring billing and automated invoicing
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Export Data
          </button>
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">
              Total Revenue
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            ${analytics?.totalRevenue?.toLocaleString() || "0"}
          </span>
          <p className="text-xs text-green-600 mt-1">+15% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            ${analytics?.pendingAmount?.toLocaleString() || "0"}
          </span>
          <p className="text-xs text-gray-600 mt-1">
            {invoices.filter((inv) => inv.status === "pending").length} invoices
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            ${analytics?.overdueAmount?.toLocaleString() || "0"}
          </span>
          <p className="text-xs text-red-600 mt-1">Requires attention</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              Recurring Revenue
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            ${analytics?.recurringRevenue?.toLocaleString() || "0"}
          </span>
          <p className="text-xs text-blue-600 mt-1">Per month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recent Invoices
          </button>
          <button
            onClick={() => setSelectedTab("recurring")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "recurring"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recurring Billing
          </button>
          <button
            onClick={() => setSelectedTab("analytics")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "analytics"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Analytics
          </button>
        </div>

        <div className="p-6">
          {selectedTab === "overview" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <div className="flex space-x-2">
                    {["all", "paid", "pending", "overdue", "draft"].map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === filter
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Invoice
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </span>
                            {invoice.recurring.isRecurring && (
                              <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                Recurring
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {invoice.client.name}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {invoice.services[0]?.name || "Multiple services"}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          ${invoice.total.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:underline text-sm">
                              View
                            </button>
                            <button className="text-gray-600 hover:underline text-sm">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === "recurring" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recurring Billing Setup
                </h3>
                <button
                  onClick={() => setShowCreateRecurringModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Recurring Service
                </button>
              </div>

              <div className="grid gap-6">
                {recurringBilling.map((billing) => (
                  <div
                    key={billing._id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {billing.name}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                              billing.status
                            )}`}
                          >
                            {billing.status.charAt(0).toUpperCase() +
                              billing.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {billing.client.name}
                        </p>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              Amount
                            </span>
                            <p className="font-medium text-gray-900">
                              ${billing.total}/month
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Frequency
                            </span>
                            <p className="font-medium text-gray-900">
                              {billing.frequency
                                .replace("_", "-")
                                .charAt(0)
                                .toUpperCase() +
                                billing.frequency.replace("_", "-").slice(1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Next Billing
                            </span>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                billing.nextBillingDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateRecurringBilling(
                              billing._id,
                              billing.status === "active" ? "paused" : "active"
                            )
                          }
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-sm"
                        >
                          {billing.status === "active" ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecurringBilling(billing._id)
                          }
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Analytics
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Monthly Revenue Trend
                  </h4>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">
                      Revenue Chart Placeholder
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Payment Status Distribution
                  </h4>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">
                      Payment Status Chart Placeholder
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Average Invoice Value
                  </h4>
                  <span className="text-2xl font-bold text-blue-600">
                    ${analytics?.averageInvoiceValue?.toFixed(0) || "0"}
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    +8% from last month
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Collection Rate
                  </h4>
                  <span className="text-2xl font-bold text-green-600">
                    {analytics?.collectionRate?.toFixed(1) || "0"}%
                  </span>
                  <p className="text-sm text-green-700 mt-1">
                    Excellent performance
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">
                    Time to Payment
                  </h4>
                  <span className="text-2xl font-bold text-purple-600">
                    12 days
                  </span>
                  <p className="text-sm text-purple-700 mt-1">
                    Industry average: 16 days
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onCreate={handleCreateInvoice}
      />

      <CreateRecurringBillingModal
        isOpen={showCreateRecurringModal}
        onClose={() => setShowCreateRecurringModal(false)}
        onCreate={handleCreateRecurringBilling}
      />
    </div>
  );
}
