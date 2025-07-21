import React, { useState } from "react";
import {
  Lock,
  Key,
  Clock,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useEnableTwoFactorAuthMutation,
  useDisableTwoFactorAuthMutation,
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetLoginHistoryQuery,
  useGenerateApiKeyMutation,
  useRevokeApiKeyMutation,
  useChangePasswordMutation,
} from "../store/securityApi";

export default function Security() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    data: securitySettings,
    isLoading,
    error,
  } = useGetSecuritySettingsQuery();
  const { data: activeSessions } = useGetActiveSessionsQuery();
  const { data: loginHistory } = useGetLoginHistoryQuery();

  const [updateSecuritySettings] = useUpdateSecuritySettingsMutation();
  const [enableTwoFactorAuth] = useEnableTwoFactorAuthMutation();
  const [disableTwoFactorAuth] = useDisableTwoFactorAuthMutation();
  const [revokeSession] = useRevokeSessionMutation();
  const [revokeAllSessions] = useRevokeAllSessionsMutation();
  const [generateApiKey] = useGenerateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [changePassword] = useChangePasswordMutation();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed successfully");
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Failed to change password");
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const result = await enableTwoFactorAuth({
        method: "authenticator",
      }).unwrap();
      setShowTwoFactorModal(false);
      alert(
        `Two-factor authentication enabled! Backup codes: ${result.backupCodes.join(
          ", "
        )}`
      );
    } catch (err) {
      console.error("Error enabling two-factor auth:", err);
      alert("Failed to enable two-factor authentication");
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      await disableTwoFactorAuth().unwrap();
      alert("Two-factor authentication disabled");
    } catch (err) {
      console.error("Error disabling two-factor auth:", err);
      alert("Failed to disable two-factor authentication");
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const result = await generateApiKey().unwrap();
      setNewApiKey(result.apiKey);
      setShowNewApiKey(true);
      setShowApiKeyModal(false);
    } catch (err) {
      console.error("Error generating API key:", err);
      alert("Failed to generate API key");
    }
  };

  const handleRevokeApiKey = async () => {
    try {
      await revokeApiKey().unwrap();
      alert("API key revoked successfully");
    } catch (err) {
      console.error("Error revoking API key:", err);
      alert("Failed to revoke API key");
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession({ sessionId }).unwrap();
      alert("Session revoked successfully");
    } catch (err) {
      console.error("Error revoking session:", err);
      alert("Failed to revoke session");
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessions().unwrap();
      alert("All sessions revoked successfully");
    } catch (err) {
      console.error("Error revoking all sessions:", err);
      alert("Failed to revoke all sessions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading security settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to load security settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-1">
          Manage your account security and privacy settings
        </p>
      </div>

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
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("sessions")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "sessions"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active Sessions
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              selectedTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Login History
          </button>
        </div>

        <div className="p-6">
          {selectedTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Password
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Change your account password to keep your account secure.
                  </p>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Change Password
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Smartphone className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    {securitySettings?.twoFactorAuth.enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {securitySettings?.twoFactorAuth.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (securitySettings?.twoFactorAuth.enabled) {
                        handleDisableTwoFactor();
                      } else {
                        setShowTwoFactorModal(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                      securitySettings?.twoFactorAuth.enabled
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {securitySettings?.twoFactorAuth.enabled
                      ? "Disable"
                      : "Enable"}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      API Key
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Generate or revoke API keys for programmatic access.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Generate Key
                    </button>
                    <button
                      onClick={handleRevokeApiKey}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      Revoke
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Session Timeout
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Current timeout: {securitySettings?.sessionTimeout || 24}{" "}
                    hours
                  </p>
                  <select
                    value={securitySettings?.sessionTimeout || 24}
                    onChange={(e) => {
                      updateSecuritySettings({
                        sessionTimeout: parseInt(e.target.value),
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={168}>7 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Sessions
                </h3>
                <button
                  onClick={handleRevokeAllSessions}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  Revoke All
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions?.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.device}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last active:{" "}
                          {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          session.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.status}
                      </span>
                      {session.id !== "current" && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Login History
              </h3>

              <div className="space-y-3">
                {loginHistory?.map((login) => (
                  <div
                    key={login.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {login.device}
                        </p>
                        <p className="text-sm text-gray-600">
                          {login.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(login.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        login.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {login.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enable Two-Factor Authentication
            </h3>
            <p className="text-gray-600 mb-6">
              Two-factor authentication adds an extra layer of security to your
              account by requiring a code from your authenticator app.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleEnableTwoFactor}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Enable
              </button>
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generate API Key
            </h3>
            <p className="text-gray-600 mb-6">
              Generate a new API key for programmatic access to your account.
              Keep this key secure and don't share it with anyone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateApiKey}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Generate
              </button>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              New API Key Generated
            </h3>
            <p className="text-gray-600 mb-4">
              Your new API key has been generated. Copy it now as it won't be
              shown again.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <code className="text-sm break-all">{newApiKey}</code>
            </div>
            <button
              onClick={() => {
                setShowNewApiKey(false);
                setNewApiKey("");
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              I've Copied It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
