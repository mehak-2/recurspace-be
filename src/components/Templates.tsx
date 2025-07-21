import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2,
  X,
} from "lucide-react";
import {
  useGetTemplatesQuery,
  useGetTemplateStatsQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
  useExecuteTemplateMutation,
  type Template,
  type Variable,
} from "../store/templatesApi";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    templateData: Omit<Template, "_id" | "user" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

interface ExecuteTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | undefined;
  onExecute: (
    templateId: string,
    variables: Record<string, string>
  ) => Promise<void>;
}

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | undefined;
  onUpdate: (
    templateId: string,
    templateData: Partial<Template>
  ) => Promise<void>;
}

function CreateTemplateModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "task" as Template["type"],
    category: "business" as Template["category"],
    content: "",
    variables: [],
    metadata: {
      estimatedTime: 15,
      difficulty: "easy" as Template["metadata"]["difficulty"],
      tags: [],
      version: "1.0.0",
    },
    automation: {
      enabled: false,
      triggers: [],
      conditions: [],
      actions: [],
    },
    usage: {
      totalUses: 0,
      successRate: 100,
    },
    permissions: {
      isPublic: false,
      allowDuplication: true,
      allowModification: true,
    },
    status: "draft" as const,
    collaborators: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) return;

    try {
      setLoading(true);
      await onCreate(formData);
      setFormData({
        name: "",
        description: "",
        type: "task",
        category: "business",
        content: "",
        variables: [],
        metadata: {
          estimatedTime: 15,
          difficulty: "easy",
          tags: [],
          version: "1.0.0",
        },
        automation: {
          enabled: false,
          triggers: [],
          conditions: [],
          actions: [],
        },
        usage: {
          totalUses: 0,
          successRate: 100,
        },
        permissions: {
          isPublic: false,
          allowDuplication: true,
          allowModification: true,
        },
        status: "draft",
        collaborators: [],
      });
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Template name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Template["type"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="task">Task</option>
                <option value="workflow">Workflow</option>
                <option value="email">Email</option>
                <option value="document">Document</option>
                <option value="report">Report</option>
                <option value="automation">Automation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as Template["category"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="business">Business</option>
              <option value="personal">Personal</option>
              <option value="project">Project</option>
              <option value="communication">Communication</option>
              <option value="reporting">Reporting</option>
              <option value="automation">Automation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Template description"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Template content (use {{variable}} for placeholders)"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.metadata.estimatedTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      estimatedTime: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.metadata.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      difficulty: e.target
                        .value as Template["metadata"]["difficulty"],
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
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
                  <span>Create Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExecuteTemplateModal({
  isOpen,
  onClose,
  template,
  onExecute,
}: ExecuteTemplateModalProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    try {
      setLoading(true);
      await onExecute(template._id, variables);
      setVariables({});
    } catch (error) {
      console.error("Error executing template:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Execute Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-1">{template.name}</h3>
          <p className="text-sm text-blue-700">{template.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {template.variables && template.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables
              </label>
              {template.variables?.map((variable: Variable) => (
                <div key={variable.name} className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    {variable.name}
                  </label>
                  <input
                    type="text"
                    value={variables[variable.name] || ""}
                    onChange={(e) =>
                      setVariables({
                        ...variables,
                        [variable.name]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={variable.description || variable.name}
                  />
                </div>
              ))}
            </div>
          )}

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
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <span>Execute Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTemplateModal({
  isOpen,
  onClose,
  template,
  onUpdate,
}: EditTemplateModalProps) {
  const [formData, setFormData] = useState<Partial<Template>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        type: template.type,
        category: template.category,
        content: template.content,
        metadata: template.metadata,
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !formData.name?.trim() || !formData.content?.trim())
      return;

    try {
      setLoading(true);
      await onUpdate(template._id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Template name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type || "task"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Template["type"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="task">Task</option>
                <option value="workflow">Workflow</option>
                <option value="email">Email</option>
                <option value="document">Document</option>
                <option value="report">Report</option>
                <option value="automation">Automation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category || "business"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as Template["category"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="business">Business</option>
              <option value="personal">Personal</option>
              <option value="project">Project</option>
              <option value="communication">Communication</option>
              <option value="reporting">Reporting</option>
              <option value="automation">Automation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Template description"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Template content (use {{variable}} for placeholders)"
              rows={6}
              required
            />
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Update Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const {
    data: templates,
    isLoading,
    error: queryError,
  } = useGetTemplatesQuery();

  const templatesArray = Array.isArray(templates) ? templates : [];
  const { data: stats } = useGetTemplateStatsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >(undefined);
  const [showEditModal, setShowEditModal] = useState(false);

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [duplicateTemplate] = useDuplicateTemplateMutation();
  const [executeTemplate] = useExecuteTemplateMutation();

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await duplicateTemplate(templateId).unwrap();
    } catch (err) {
      console.error("Error duplicating template:", err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId).unwrap();
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  const handleExecuteTemplate = async (
    templateId: string,
    variables: Record<string, string>
  ) => {
    try {
      const result = await executeTemplate({
        id: templateId,
        variables,
      }).unwrap();
      console.log("Template executed:", result);
      setShowExecuteModal(false);
      setSelectedTemplate(undefined);
    } catch (err) {
      console.error("Error executing template:", err);
    }
  };

  const handleCreateTemplate = async (
    templateData: Omit<Template, "_id" | "user" | "createdAt" | "updatedAt">
  ) => {
    try {
      await createTemplate(templateData).unwrap();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating template:", err);
    }
  };

  const handleUpdateTemplate = async (
    templateId: string,
    templateData: Partial<Template>
  ) => {
    try {
      await updateTemplate({ id: templateId, template: templateData }).unwrap();
      setShowEditModal(false);
      setSelectedTemplate(undefined);
    } catch (err) {
      console.error("Error updating template:", err);
    }
  };

  const handleCreateModalOpen = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  const handleExecuteModalClose = () => {
    setShowExecuteModal(false);
    setSelectedTemplate(undefined);
  };

  const handleExecuteModalOpen = (template: Template) => {
    setSelectedTemplate(template);
    setShowExecuteModal(true);
  };

  const handleEditModalOpen = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedTemplate(undefined);
  };

  const categories = [
    { id: "all", name: "All Templates", icon: FileText },
    { id: "email", name: "Email", icon: Mail },
    { id: "proposal", name: "Proposals", icon: FileText },
    { id: "billing", name: "Billing", icon: DollarSign },
    { id: "meeting", name: "Meetings", icon: Calendar },
    { id: "report", name: "Reports", icon: FileText },
    { id: "contract", name: "Contracts", icon: FileText },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      email: "bg-blue-100 text-blue-800",
      proposal: "bg-green-100 text-green-800",
      billing: "bg-purple-100 text-purple-800",
      meeting: "bg-orange-100 text-orange-800",
      report: "bg-indigo-100 text-indigo-800",
      contract: "bg-red-100 text-red-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const filteredTemplates =
    selectedCategory === "all"
      ? templatesArray
      : templatesArray.filter(
          (template: Template) => template.category === selectedCategory
        );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {queryError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">Failed to load templates</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Templates</h1>
          <p className="text-gray-600 mt-1">
            Create and manage reusable templates for common tasks
          </p>
        </div>
        <button
          onClick={handleCreateModalOpen}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Templates
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.totalTemplates}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Copy className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Uses
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.totalUsage}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Time Saved
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.timeSaved}h
            </span>
            <p className="text-xs text-green-600 mt-1">This month</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">
                Most Used
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.mostUsed}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {templatesArray.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No templates found. Create your first template to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template: Template) => (
                <div
                  key={template._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(
                        template.category
                      )}`}
                    >
                      {template.category}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditModalOpen(template)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Used {template.usage.totalUses} times
                      </span>
                      <span className="text-green-600 font-medium">
                        {template.metadata?.estimatedTime || 15} min per use
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.metadata?.tags?.map(
                        (tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Last used{" "}
                        {template.usage.lastUsed
                          ? new Date(
                              template.usage.lastUsed
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                      <button
                        onClick={() => handleExecuteModalOpen(template)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        onCreate={handleCreateTemplate}
      />

      <ExecuteTemplateModal
        isOpen={showExecuteModal}
        onClose={handleExecuteModalClose}
        template={selectedTemplate}
        onExecute={handleExecuteTemplate}
      />

      <EditTemplateModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        template={selectedTemplate}
        onUpdate={handleUpdateTemplate}
      />
    </div>
  );
}
