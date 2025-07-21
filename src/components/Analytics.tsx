import React, { useState } from "react";
import { TrendingUp, Clock, Target, Filter } from "lucide-react";
import { useGetDashboardAnalyticsQuery } from "../store/analyticsApi";

export default function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const {
    data: analytics,
    isLoading,
    error,
  } = useGetDashboardAnalyticsQuery({ timeframe: selectedTimeframe });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-600">Failed to load analytics</span>
      </div>
    );
  }

  const efficiencyMetrics = [
    {
      metric: "Time Saved",
      value: `${analytics.efficiencyMetrics.timeSaved} hours`,
      color: "text-green-600",
    },
    {
      metric: "Tasks Automated",
      value: analytics.efficiencyMetrics.tasksAutomated,
      color: "text-blue-600",
    },
    {
      metric: "Efficiency Score",
      value: `${analytics.efficiencyMetrics.efficiencyScore}%`,
      color: "text-purple-600",
    },
    {
      metric: "Revenue per Hour",
      value: `$${analytics.efficiencyMetrics.revenuePerHour}`,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Efficiency Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Track your productivity patterns and optimization opportunities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {["week", "month", "quarter", "year"].map((id) => (
                <option key={id} value={id}>
                  {id === "week"
                    ? "This Week"
                    : id === "month"
                    ? "This Month"
                    : id === "quarter"
                    ? "This Quarter"
                    : "This Year"}
                </option>
              ))}
            </select>
          </div>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {efficiencyMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {metric.metric}
              </span>
            </div>
            <span
              className={`text-2xl font-bold text-gray-900 ${metric.color}`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Weekly Productivity Trend
            </h2>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-4">
            {analytics.productivityTrends.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {day.day}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Efficiency: {day.efficiency}%</span>
                      <span>{day.tasks} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${day.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Tracking Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Time Analysis
            </h2>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.timeAnalysis.timeWorked}h
                </div>
                <div className="text-sm text-blue-700">Time Worked</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.timeAnalysis.timeProjected}h
                </div>
                <div className="text-sm text-green-700">Time Projected</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Efficiency vs. Target
                </span>
                <span className="text-sm font-medium text-green-600">
                  {analytics.timeAnalysis.efficiencyVsTarget}% achieved
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.timeAnalysis.efficiencyVsTarget}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Time Distribution
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client Work</span>
                  <span className="text-sm font-medium">
                    {analytics.timeAnalysis.timeDistribution.clientWork}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admin Tasks</span>
                  <span className="text-sm font-medium">
                    {analytics.timeAnalysis.timeDistribution.adminTasks}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Learning</span>
                  <span className="text-sm font-medium">
                    {analytics.timeAnalysis.timeDistribution.learning}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Performance Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Client Performance Analysis
          </h2>
          <Target className="w-5 h-5 text-orange-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Client
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Tasks Completed
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Time Spent
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Efficiency
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Revenue
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.clientProductivity.map((client, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 font-medium text-gray-900">
                    {client.client}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{client.tasks}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {client.timeSpent}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${client.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {client.efficiency}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-green-600">
                    {client.revenue}
                  </td>
                  <td className="py-4 px-4">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          AI-Powered Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Top Insights</h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border border-${insight.color}-200 bg-${insight.color}-50`}
                >
                  <p
                    className={`text-sm font-medium text-${insight.color}-900`}
                  >
                    {insight.title}
                  </p>
                  <p className={`text-xs mt-1 text-${insight.color}-700`}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recommendations</h3>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border border-${rec.color}-200 bg-${rec.color}-50`}
                >
                  <p className={`text-sm font-medium text-${rec.color}-900`}>
                    {rec.title}
                  </p>
                  <p className={`text-xs mt-1 text-${rec.color}-700`}>
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
