import React, { useState } from "react";
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import {
  useGetAIOptimizationsQuery,
  useGetAIOptimizationStatsQuery,
  useGetAIOptimizationPatternsQuery,
  useGetAIOptimizationRulesQuery,
  useGenerateAIOptimizationsMutation,
  useUpdateAIOptimizationStatusMutation,
  useCreateAutomationRuleMutation,
  type AutomationRule,
  type AIOptimization,
  type Pattern,
} from "../store/aiOptimizerApi";
import RuleCreationModal from "./RuleCreationModal";

export default function AIOptimizer() {
  const [selectedTab, setSelectedTab] = useState("suggestions");
  const {
    data: suggestions,
    isLoading,
    error: queryError,
  } = useGetAIOptimizationsQuery();

  const suggestionsArray = Array.isArray(suggestions) ? suggestions : [];
  const { data: stats } = useGetAIOptimizationStatsQuery();
  const { data: patternAnalysis } = useGetAIOptimizationPatternsQuery();
  const { data: rulesData } = useGetAIOptimizationRulesQuery();
  const [analyzing, setAnalyzing] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const [generateAIOptimizations] = useGenerateAIOptimizationsMutation();
  const [updateAIOptimizationStatus] = useUpdateAIOptimizationStatusMutation();
  const [createAutomationRule] = useCreateAutomationRuleMutation();

  const handleAnalyzeNow = async () => {
    try {
      setAnalyzing(true);
      await generateAIOptimizations({ type: "general" }).unwrap();
    } catch (err) {
      console.error("Error generating optimizations:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (id: string) => {
    try {
      await updateAIOptimizationStatus({ id, status: "applied" }).unwrap();
    } catch (err) {
      console.error("Error applying suggestion:", err);
    }
  };

  const handleCreateRule = async (ruleName: string, action: string) => {
    if (!selectedPattern) return;

    try {
      await createAutomationRule({
        pattern: selectedPattern.pattern,
        name: ruleName,
        action,
      }).unwrap();

      setShowRuleModal(false);
      setSelectedPattern(null);
    } catch (err) {
      console.error("Error creating rule:", err);
    }
  };

  const handleCreateRuleClick = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setShowRuleModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      case "low":
        return <Target className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading AI Optimizer...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {queryError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">
              Failed to load AI optimization data
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Optimizer</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights to optimize your workflows
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAnalyzeNow}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span>{analyzing ? "Analyzing..." : "Analyze Now"}</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                AI Suggestions
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats?.total || 0}
            </span>
            <p className="text-xs text-green-600 mt-1">
              +{(stats?.total || 0) - (stats?.applied || 0)} pending
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Potential Savings
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats?.totalSavings?.time || 0}h
            </span>
            <p className="text-xs text-blue-600 mt-1">Per week</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Patterns Found
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {patternAnalysis?.summary.totalPatterns || 0}
            </span>
            <p className="text-xs text-orange-600 mt-1">
              Optimization opportunities
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Applied</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats?.applied || 0}
            </span>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.applicationRate || 0}% success rate
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("suggestions")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "suggestions"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            AI Suggestions
          </button>
          <button
            onClick={() => setSelectedTab("patterns")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "patterns"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pattern Analysis
          </button>
        </div>

        <div className="p-6">
          {selectedTab === "suggestions" && (
            <div className="space-y-6">
              {suggestionsArray.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No AI suggestions yet. Click "Analyze Now" to generate
                    optimizations.
                  </p>
                </div>
              ) : (
                suggestionsArray.map((suggestion: AIOptimization) => (
                  <div
                    key={suggestion._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(
                              suggestion.priority
                            )}`}
                          >
                            {getPriorityIcon(suggestion.priority)}
                            <span>{suggestion.priority.toUpperCase()}</span>
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                            {suggestion.category}
                          </span>
                          {suggestion.status === "applied" && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                              APPLIED
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {suggestion.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {suggestion.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              Impact
                            </span>
                            <p
                              className={`font-medium ${getImpactColor(
                                suggestion.impact
                              )}`}
                            >
                              {suggestion.impact.charAt(0).toUpperCase() +
                                suggestion.impact.slice(1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Time Savings
                            </span>
                            <p className="font-medium text-green-600">
                              {suggestion.estimatedSavings.time}h
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              AI Confidence
                            </span>
                            <p className="font-medium text-blue-600">
                              {suggestion.confidence}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${suggestion.confidence}%` }}
                        ></div>
                      </div>

                      <div className="flex space-x-2">
                        {suggestion.status !== "applied" && (
                          <button
                            onClick={() =>
                              handleApplySuggestion(suggestion._id)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Apply Suggestion
                          </button>
                        )}
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === "patterns" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Detected Patterns
                </h3>
                <p className="text-gray-600">
                  AI analysis of your work patterns over the last 90 days
                </p>
                {patternAnalysis && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-500">
                        Total Patterns
                      </span>
                      <p className="font-semibold text-gray-900">
                        {patternAnalysis.summary.totalPatterns}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-500">High Impact</span>
                      <p className="font-semibold text-orange-600">
                        {patternAnalysis.summary.highImpactPatterns}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-500">
                        Avg Confidence
                      </span>
                      <p className="font-semibold text-blue-600">
                        {patternAnalysis.summary.averageConfidence}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!patternAnalysis?.patterns ||
              patternAnalysis.patterns.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No patterns detected yet. Continue using the system to
                    generate pattern insights.
                  </p>
                </div>
              ) : (
                patternAnalysis.patterns.map(
                  (pattern: Pattern, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {pattern.pattern}
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-gray-500">
                                Frequency
                              </span>
                              <p className="font-medium text-gray-900">
                                {pattern.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Impact
                              </span>
                              <p className="font-medium text-orange-600">
                                {pattern.impact}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Recommendation
                              </span>
                              <p className="font-medium text-blue-600">
                                {pattern.recommendation}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-sm text-gray-500">
                              Confidence:{" "}
                            </span>
                            <span className="font-medium text-blue-600">
                              {pattern.confidence}%
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCreateRuleClick(pattern)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                        >
                          Create Rule
                        </button>
                      </div>
                    </div>
                  )
                )
              )}

              {rulesData?.rules && rulesData.rules.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Active Automation Rules
                  </h4>
                  <div className="space-y-3">
                    {rulesData.rules.map(
                      (rule: AutomationRule, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-green-900">
                              {rule.name}
                            </p>
                            <p className="text-sm text-green-700">
                              Action: {rule.action.replace("_", " ")}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                            {rule.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RuleCreationModal
        isOpen={showRuleModal}
        onClose={() => {
          setShowRuleModal(false);
          setSelectedPattern(null);
        }}
        pattern={selectedPattern!}
        onCreateRule={handleCreateRule}
      />
    </div>
  );
}
