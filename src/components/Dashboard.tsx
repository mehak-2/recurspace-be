import React, { useState } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Zap,
  ArrowRight,
  RefreshCw,
  FileText,
  Plus,
} from "lucide-react";
import TaskManager from "./TaskManager";
import { useGetTasksQuery } from "../store/tasksApi";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");
  const { data: tasks, isLoading } = useGetTasksQuery({
    status: "pending",
  });

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const completedTasks = tasksArray.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = tasksArray.filter(
    (task) => task.status === "pending"
  ).length;
  const inProgressTasks = tasksArray.filter(
    (task) => task.status === "in-progress"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab("tasks")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Connect Apps
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "tasks"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tasks ({tasksArray.length})
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4.2h</h3>
              <p className="text-gray-600 text-sm">Time Saved This Week</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {completedTasks}
              </h3>
              <p className="text-gray-600 text-sm">Tasks Completed</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+15%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">$2,840</h3>
              <p className="text-gray-600 text-sm">Revenue This Month</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+25%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">87%</h3>
              <p className="text-gray-600 text-sm">Efficiency Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Insights & Suggestions
                </h2>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Optimize Your Friday Workflow
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        You're consistently late with YouTube edits on Fridays.
                        Consider reducing batch size or moving to Thursday.
                      </p>
                      <button className="text-xs text-blue-600 font-medium mt-2 hover:underline">
                        Apply Suggestion
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-green-900">
                        Billing Cycle Optimization
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Sync your billing cycle with content delivery every 15
                        days to improve cash flow.
                      </p>
                      <button className="text-xs text-green-600 font-medium mt-2 hover:underline">
                        Set Up Auto-billing
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-purple-900">
                        Template Opportunity
                      </h3>
                      <p className="text-sm text-purple-700 mt-1">
                        Create a template for your weekly client updates -
                        you're writing similar emails repeatedly.
                      </p>
                      <button className="text-xs text-purple-600 font-medium mt-2 hover:underline">
                        Create Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Task Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {completedTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">
                    {inProgressTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-orange-600">
                    {pendingTasks}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("tasks")}
                className="w-full mt-6 text-center text-sm text-blue-600 font-medium hover:underline flex items-center justify-center space-x-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab("tasks")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Create Recurring Task
                </h3>
                <p className="text-sm text-gray-600">
                  Set up automated recurring workflows
                </p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Generate Template
                </h3>
                <p className="text-sm text-gray-600">
                  Create smart templates for common tasks
                </p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Setup Billing
                </h3>
                <p className="text-sm text-gray-600">
                  Configure automated billing cycles
                </p>
              </button>
            </div>
          </div>
        </>
      ) : (
        <TaskManager />
      )}
    </div>
  );
}
