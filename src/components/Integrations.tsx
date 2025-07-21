import React, { useState } from "react";
import {
  Calendar,
  Mail,
  MessageSquare,
  Github,
  FileText,
  Trello,
  Link,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useGetIntegrationsQuery,
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation,
  type Integration,
} from "../store/integrationsApi";
import { useGetOAuthUrlsQuery } from "../store/oauthApi";

const integrationConfig = {
  googleCalendar: {
    name: "Google Calendar",
    description: "Sync your calendar events and schedule",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  gmail: {
    name: "Gmail",
    description: "Connect your email for task creation",
    icon: Mail,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  slack: {
    name: "Slack",
    description: "Get notifications and create tasks from Slack",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  github: {
    name: "GitHub",
    description: "Sync issues and pull requests as tasks",
    icon: Github,
    color: "text-gray-800",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  notion: {
    name: "Notion",
    description: "Import pages and databases as tasks",
    icon: FileText,
    color: "text-black",
    bgColor: "bg-black-50",
    borderColor: "border-black-200",
  },
  trello: {
    name: "Trello",
    description: "Sync boards and cards as workflows",
    icon: Trello,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingIntegration, setConnectingIntegration] = useState<
    string | null
  >(null);

  const { data: integrations, isLoading, error } = useGetIntegrationsQuery();
  const { data: oauthUrls } = useGetOAuthUrlsQuery();
  const [disconnectIntegration, { isLoading: disconnecting }] =
    useDisconnectIntegrationMutation();
  const [syncIntegration, { isLoading: syncing }] =
    useSyncIntegrationMutation();

  const handleConnect = async (integrationName: string) => {
    try {
      setConnectingIntegration(integrationName);
      setShowConnectModal(false);
      setSelectedIntegration(null);

      // Get the OAuth URL for this integration
      const oauthUrl = getOAuthUrl(integrationName);
      if (!oauthUrl) {
        throw new Error("OAuth URL not available");
      }

      // Redirect to OAuth provider
      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Error connecting integration:", err);
      alert("Failed to connect integration. Please try again.");
      setConnectingIntegration(null);
    }
  };

  const handleDisconnect = async (integrationName: string) => {
    try {
      await disconnectIntegration({ integration: integrationName }).unwrap();
    } catch (err) {
      console.error("Error disconnecting integration:", err);
    }
  };

  const handleSync = async (integrationName: string) => {
    try {
      await syncIntegration({
        integration: integrationName,
        data: { direction: "bidirectional" },
      }).unwrap();
    } catch (err) {
      console.error("Error syncing integration:", err);
    }
  };

  const getStatusIcon = (integration: Integration) => {
    if (!integration.connected) {
      return <XCircle className="w-5 h-5 text-gray-400" />;
    }

    if (integration.lastSync) {
      const lastSync = new Date(integration.lastSync);
      const hoursSinceSync =
        (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync < 24) {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      } else {
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      }
    }

    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = (integration: Integration) => {
    if (!integration.connected) {
      return "Not connected";
    }

    if (integration.lastSync) {
      const lastSync = new Date(integration.lastSync);
      const hoursSinceSync =
        (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync < 1) {
        return "Synced recently";
      } else if (hoursSinceSync < 24) {
        return `Synced ${Math.floor(hoursSinceSync)}h ago`;
      } else {
        return `Synced ${Math.floor(hoursSinceSync / 24)}d ago`;
      }
    }

    return "Connected";
  };

  const getOAuthUrl = (integrationName: string) => {
    if (!oauthUrls) return null;

    switch (integrationName) {
      case "googleCalendar":
        return oauthUrls.googleCalendar?.authUrl;
      case "github":
        return oauthUrls.githubIntegration?.authUrl;
      case "slack":
        return oauthUrls.slack?.authUrl;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to load integrations</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">
          Connect your favorite tools to streamline your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(integrations || {}).map(([key, integration]) => {
          const config =
            integrationConfig[key as keyof typeof integrationConfig];
          const IconComponent = config.icon;

          return (
            <div
              key={key}
              className={`border rounded-xl p-6 ${config.bgColor} ${config.borderColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>
                {getStatusIcon(integration)}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Status:{" "}
                  <span className="font-medium">
                    {getStatusText(integration)}
                  </span>
                </p>
                {integration.lastSync && (
                  <p className="text-xs text-gray-500">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                {!integration.connected ? (
                  <button
                    onClick={() => {
                      setSelectedIntegration(key);
                      setShowConnectModal(true);
                    }}
                    disabled={connectingIntegration === key}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {connectingIntegration === key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    <span>
                      {connectingIntegration === key
                        ? "Connecting..."
                        : "Connect"}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSync(key)}
                      disabled={syncing}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {syncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(key)}
                      disabled={disconnecting}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {disconnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect{" "}
                {
                  integrationConfig[
                    selectedIntegration as keyof typeof integrationConfig
                  ]?.name
                }
              </h3>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedIntegration(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Link className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    OAuth Authorization Flow
                  </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    1. Redirect to{" "}
                    {
                      integrationConfig[
                        selectedIntegration as keyof typeof integrationConfig
                      ]?.name
                    }
                  </p>
                  <p>2. User authorizes RecurSpace access</p>
                  <p>3. Provider redirects back with authorization code</p>
                  <p>4. Backend exchanges code for access tokens</p>
                  <p>5. Tokens stored securely in database</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Requested Permissions:
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedIntegration === "googleCalendar" && (
                    <>
                      <p>• Read your calendar events</p>
                      <p>• Create and modify calendar events</p>
                      <p>• Access calendar settings</p>
                    </>
                  )}
                  {selectedIntegration === "gmail" && (
                    <>
                      <p>• Read your emails</p>
                      <p>• Send emails on your behalf</p>
                      <p>• Access email labels and threads</p>
                    </>
                  )}
                  {selectedIntegration === "slack" && (
                    <>
                      <p>• Read channel messages</p>
                      <p>• Send messages to channels</p>
                      <p>• Access workspace information</p>
                    </>
                  )}
                  {selectedIntegration === "github" && (
                    <>
                      <p>• Read repository contents</p>
                      <p>• Access issues and pull requests</p>
                      <p>• Read user profile information</p>
                    </>
                  )}
                  {selectedIntegration === "notion" && (
                    <>
                      <p>• Read pages and databases</p>
                      <p>• Create and update content</p>
                      <p>• Access workspace information</p>
                    </>
                  )}
                  {selectedIntegration === "trello" && (
                    <>
                      <p>• Read boards and cards</p>
                      <p>• Create and update cards</p>
                      <p>• Access board members and lists</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Demo Mode
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This simulates the OAuth flow. In production, you would be
                  redirected to the actual provider's authorization page.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleConnect(selectedIntegration)}
                disabled={connectingIntegration === selectedIntegration}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {connectingIntegration === selectedIntegration ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    <span>Authorize & Connect</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedIntegration(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
