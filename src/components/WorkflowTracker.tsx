import React, { useState } from "react";
import { Calendar, Clock, Repeat, Plus, Filter, Search, X } from "lucide-react";
import {
  useGetWorkflowsQuery,
  useGetWorkflowStatsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  type Workflow,
} from "../store/workflowsApi";

export default function WorkflowTracker() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [editWorkflow, setEditWorkflow] = useState({
    name: "",
    description: "",
    type: "manual" as const,
    frequency: "Weekly",
    priority: "medium" as const,
    clients: [] as string[],
    tags: [] as string[],
  });
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    type: "manual" as const,
    frequency: "Weekly",
    priority: "medium" as const,
    clients: [] as string[],
    tags: [] as string[],
  });

  const { data: workflows } = useGetWorkflowsQuery({
    status: selectedFilter === "all" ? undefined : selectedFilter,
    search: search || undefined,
  });

  const workflowsArray = Array.isArray(workflows) ? workflows : [];
  const { data: stats } = useGetWorkflowStatsQuery();

  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [deleteWorkflow] = useDeleteWorkflowMutation();

  const handleCreateWorkflow = async () => {
    try {
      await createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        type: newWorkflow.type,
        frequency: newWorkflow.frequency,
        priority: newWorkflow.priority,
        status: "active",
        startDate: new Date().toISOString(),
        steps: [],
        currentStep: 0,
        progress: 0,
        automation: {
          enabled: false,
          triggers: [],
          conditions: [],
          actions: [],
        },
        metrics: {
          totalSteps: 0,
          completedSteps: 0,
          totalTime: 0,
          averageStepTime: 0,
          efficiency: 0,
          completionRate: 0,
        },
        collaborators: [],
        clients: newWorkflow.clients,
        tags: newWorkflow.tags,
      });
      setShowCreateModal(false);
      setNewWorkflow({
        name: "",
        description: "",
        type: "manual",
        frequency: "Weekly",
        priority: "medium",
        clients: [],
        tags: [],
      });
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow) return;
    try {
      await updateWorkflow({
        id: selectedWorkflow._id,
        workflow: editWorkflow,
      }).unwrap();
      setShowEditModal(false);
      setSelectedWorkflow(null);
      setEditWorkflow({
        name: "",
        description: "",
        type: "manual",
        frequency: "Weekly",
        priority: "medium",
        clients: [],
        tags: [],
      });
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId).unwrap();
      setShowEditModal(false);
      setSelectedWorkflow(null);
      setEditWorkflow({
        name: "",
        description: "",
        type: "manual",
        frequency: "Weekly",
        priority: "medium",
        clients: [],
        tags: [],
      });
    } catch (error) {
      console.error("Error deleting workflow:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "optimizing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "needs_attention":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "optimizing":
        return "AI Optimizing";
      case "needs_attention":
        return "Needs Attention";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Tracker</h1>
          <p className="text-gray-600 mt-1">
            Monitor and optimize your recurring workflows
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              Active Workflows
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats?.activeWorkflows}
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">
              Time Saved
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats?.totalTimeSaved}h
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">
              Avg Completion
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats?.avgCompletion}%
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Plus className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">
              Opportunities
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats?.opportunities}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {["all", "active", "optimizing", "needs_attention"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === filter
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() +
                      filter.slice(1).replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-4">
          {workflowsArray.map((workflow) => (
            <div
              key={workflow._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                        workflow.status
                      )}`}
                    >
                      {getStatusText(workflow.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Repeat className="w-4 h-4" />
                      <span>{workflow.type}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Next:{" "}
                        {workflow.dueDate
                          ? new Date(workflow.dueDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Saved: {workflow.metrics.totalTime}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {workflow.metrics.averageStepTime}%
                  </div>
                  <div className="text-xs text-gray-500">Completion Rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Clients: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {workflow.collaborators
                      ?.map((collaborator) => collaborator.user)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setEditWorkflow({
                        name: workflow.name,
                        description: workflow.description,
                        type: workflow.type as "manual",
                        frequency: "Weekly",
                        priority: workflow.priority as "medium",
                        clients:
                          workflow.collaborators?.map((c) => c.user) || [],
                        tags: workflow.tags || [],
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setEditWorkflow({
                        name: workflow.name,
                        description: workflow.description,
                        type: workflow.type as "manual",
                        frequency: "Weekly",
                        priority: workflow.priority as "medium",
                        clients:
                          workflow.collaborators?.map((c) => c.user) || [],
                        tags: workflow.tags || [],
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${workflow.metrics.averageStepTime}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Workflow description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newWorkflow.type}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      type: e.target.value as "manual",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="automated">Automated</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="triggered">Triggered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newWorkflow.priority}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      priority: e.target.value as "medium",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflow.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Workflow</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editWorkflow.name}
                  onChange={(e) =>
                    setEditWorkflow({ ...editWorkflow, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editWorkflow.description}
                  onChange={(e) =>
                    setEditWorkflow({
                      ...editWorkflow,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Workflow description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={editWorkflow.type}
                  onChange={(e) =>
                    setEditWorkflow({
                      ...editWorkflow,
                      type: e.target.value as "manual",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="automated">Automated</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="triggered">Triggered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={editWorkflow.priority}
                  onChange={(e) =>
                    setEditWorkflow({
                      ...editWorkflow,
                      priority: e.target.value as "medium",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateWorkflow}
                  disabled={!editWorkflow.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
