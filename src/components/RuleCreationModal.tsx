import React, { useState } from "react";
import { X } from "lucide-react";

interface RuleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: {
    pattern: string;
    frequency: string;
    impact: string;
    recommendation: string;
    confidence: number;
    category: string;
  };
  onCreateRule: (ruleName: string, action: string) => Promise<void>;
}

export default function RuleCreationModal({
  isOpen,
  onClose,
  pattern,
  onCreateRule,
}: RuleCreationModalProps) {
  const [ruleName, setRuleName] = useState(
    `Auto Rule - ${pattern?.pattern || "New Pattern"}`
  );
  const [action, setAction] = useState("create_task");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleName.trim()) {
      setError("Rule name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreateRule(ruleName, action);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Automation Rule
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-1">
            Pattern: {pattern.pattern}
          </h3>
          <p className="text-sm text-blue-700">{pattern.recommendation}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter rule name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="create_task">Create Task</option>
              <option value="update_status">Update Status</option>
              <option value="assign_user">Assign User</option>
              <option value="send_notification">Send Notification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conditions
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter conditions (JSON)"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
