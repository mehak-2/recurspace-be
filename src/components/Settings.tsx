import {
  User,
  CreditCard,
  Bell,
  Shield,
  Link,
  Calendar,
  Mail,
  Slack,
  Github,
  Loader2,
} from "lucide-react";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserSettingsQuery,
  useGetBillingInfoQuery,
  useChangePasswordMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
  useGenerateApiKeyMutation,
  type UserProfile,
  useGetActiveSessionsQuery,
} from "../store/settingsApi";
import {
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferences,
} from "../store/notificationsApi";
import { useState, useEffect } from "react";

export default function Settings() {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      email: true,
      push: false,
      weekly: true,
      billing: true,
    });

  // API Queries
  const { data: userProfile, isLoading: profileLoading } =
    useGetUserProfileQuery();
  const { data: userSettings, isLoading: settingsLoading } =
    useGetUserSettingsQuery();
  const { data: billingInfo } = useGetBillingInfoQuery();
  const { data: sessions } = useGetActiveSessionsQuery();

  const [updateProfile, { isLoading: isUpdatingProfile, error: updateError }] =
    useUpdateUserProfileMutation();

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [enable2FA] = useEnableTwoFactorMutation();
  const [disable2FA] = useDisableTwoFactorMutation();
  const [revokeSession] = useRevokeSessionMutation();
  const [revokeAllSessions] = useRevokeAllSessionsMutation();
  const [connectIntegration] = useConnectIntegrationMutation();
  const [disconnectIntegration] = useDisconnectIntegrationMutation();
  const [generateApiKey, { isLoading: generatingApiKey }] =
    useGenerateApiKeyMutation();
  const [updateNotificationPrefs] = useUpdateNotificationPreferencesMutation();

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || "",
        email: userProfile.email || "",
        company: userProfile.company || "",
        timezone: userProfile.timezone || "UTC-8",
        workHours: userProfile.workHours || {
          start: "09:00",
          end: "17:00",
        },
        workingDays: userProfile.workingDays || [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
        ],
      });
      setSelectedWorkingDays(
        userProfile.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]
      );
    }
  }, [userProfile]);

  // Initialize notification preferences when settings load
  useEffect(() => {
    if (userSettings) {
      setNotificationPreferences({
        email: userSettings.notifications.email,
        push: userSettings.notifications.push,
        weekly: userSettings.notifications.weekly,
        billing: userSettings.notifications.billing,
      });
    }
  }, [userSettings]);

  const handleProfileUpdate = async () => {
    try {
      const updateData = {
        name: profileForm.name || "",
        email: profileForm.email || "",
        company: profileForm.company || "",
        timezone: profileForm.timezone || "UTC-8",
        workHours: {
          start: profileForm.workHours?.start || "09:00",
          end: profileForm.workHours?.end || "17:00",
        },
        workingDays: selectedWorkingDays,
      };

      await updateProfile(updateData).unwrap();

      // Show success message
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      const updatedPreferences = {
        ...notificationPreferences,
        [key]: value,
      };
      setNotificationPreferences(updatedPreferences);

      await updateNotificationPrefs(updatedPreferences).unwrap();
    } catch (error) {
      console.error("Error updating notification preferences:", error);
    }
  };

  const handleIntegrationToggle = async (
    integration: string,
    isConnected: boolean
  ) => {
    try {
      if (isConnected) {
        await disconnectIntegration(integration).unwrap();
      } else {
        await connectIntegration({ integration }).unwrap();
      }
    } catch (error) {
      console.error("Error toggling integration:", error);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const result = await generateApiKey().unwrap();
      console.log("New API Key:", result.apiKey);
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  const integrations = [
    {
      name: "Google Calendar",
      icon: Calendar,
      key: "googleCalendar",
      description: "Sync your tasks and deadlines with Google Calendar",
    },
    {
      name: "Gmail",
      icon: Mail,
      key: "gmail",
      description: "Auto-detect recurring email patterns and create templates",
    },
    {
      name: "Slack",
      icon: Slack,
      key: "slack",
      description: "Get notifications and updates in your Slack workspace",
    },
    {
      name: "GitHub",
      icon: Github,
      key: "github",
      description: "Track development tasks and code review cycles",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "5 recurring tasks",
        "2 AI suggestions/month",
        "Basic templates",
        "Email support",
      ],
      current: billingInfo?.currentPlan?.name === "Free",
    },
    {
      name: "Pro",
      price: "$9",
      period: "month",
      features: [
        "Unlimited tasks",
        "Unlimited AI suggestions",
        "Advanced templates",
        "Priority support",
        "Analytics dashboard",
      ],
      current: billingInfo?.currentPlan?.name === "Pro",
    },
    {
      name: "Business",
      price: "$19",
      period: "month",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom integrations",
        "White-label options",
        "Dedicated support",
      ],
      current: billingInfo?.currentPlan?.name === "Business",
    },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Link },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account preferences and integrations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  selectedTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {selectedTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name || ""}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email || ""}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={profileForm.company || ""}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          company: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      value={profileForm.timezone || "UTC-8"}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC+1">
                        UTC+1 (Central European Time)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Work Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Hours
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="time"
                          value={profileForm.workHours?.start || "09:00"}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              workHours: {
                                end: profileForm.workHours?.end || "17:00",
                                ...profileForm.workHours,
                                start: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">
                          Start time
                        </span>
                      </div>
                      <div>
                        <input
                          type="time"
                          value={profileForm.workHours?.end || "17:00"}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              workHours: {
                                start: profileForm.workHours?.start || "09:00",
                                ...profileForm.workHours,
                                end: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">End time</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days
                    </label>
                    <div className="flex space-x-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <button
                            key={day}
                            onClick={() => {
                              if (selectedWorkingDays.includes(day)) {
                                setSelectedWorkingDays(
                                  selectedWorkingDays.filter((d) => d !== day)
                                );
                              } else {
                                setSelectedWorkingDays([
                                  ...selectedWorkingDays,
                                  day,
                                ]);
                              }
                            }}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              selectedWorkingDays.includes(day)
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {day}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
                {updateError && (
                  <div className="text-red-600 text-sm mt-2">
                    Error: {JSON.stringify(updateError)}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`border rounded-lg p-6 ${
                        plan.current
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h4>
                        {plan.current && (
                          <span className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          plan.current
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {plan.current ? "Current Plan" : "Upgrade"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {billingInfo?.paymentMethod && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Method
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          **** **** ****{" "}
                          {billingInfo.paymentMethod.cardNumber.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires {billingInfo.paymentMethod.expiryMonth}/
                          {billingInfo.paymentMethod.expiryYear}
                        </p>
                      </div>
                      <button className="ml-auto text-blue-600 hover:underline text-sm">
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {billingInfo?.billingHistory &&
                billingInfo.billingHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Billing History
                    </h3>
                    <div className="space-y-3">
                      {billingInfo.billingHistory.map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {invoice.date}
                            </p>
                            <p className="text-sm text-gray-600">Pro Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {invoice.amount}
                            </p>
                            <p className="text-sm text-green-600">
                              {invoice.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {selectedTab === "notifications" && userSettings && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.email}
                        onChange={(e) =>
                          handleNotificationChange("email", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Push Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.push}
                        onChange={(e) =>
                          handleNotificationChange("push", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Weekly Reports
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive weekly productivity reports
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.weekly}
                        onChange={(e) =>
                          handleNotificationChange("weekly", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Billing Reminders
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive billing and payment reminders
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.billing}
                        onChange={(e) =>
                          handleNotificationChange("billing", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "integrations" && userSettings && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Connected Apps
                </h3>
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    const isConnected =
                      userSettings.integrations[
                        integration.key as keyof typeof userSettings.integrations
                      ];
                    return (
                      <div
                        key={integration.name}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {integration.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {integration.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                isConnected
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {isConnected ? "Connected" : "Not Connected"}
                            </span>
                            <button
                              onClick={() =>
                                handleIntegrationToggle(
                                  integration.key,
                                  isConnected
                                )
                              }
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                isConnected
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {isConnected ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  API Access
                </h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">API Key</p>
                      <p className="text-sm text-gray-600">
                        Use this key to access RecurSpace API
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateApiKey}
                      disabled={generatingApiKey}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm disabled:opacity-50"
                    >
                      {generatingApiKey ? "Generating..." : "Generate New"}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800">
                    {userProfile?.apiKey ||
                      "rcs_sk_****************************"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Two-Factor Authentication
                </h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">2FA Status</p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        userSettings?.security.twoFactorEnabled
                          ? disable2FA()
                          : enable2FA()
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {userSettings?.security.twoFactorEnabled
                        ? "Disable 2FA"
                        : "Enable 2FA"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Session Management
                </h3>
                <div className="space-y-3">
                  {sessions?.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.device}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            session.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {session.status}
                        </span>
                        {session.status === "active" && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => revokeAllSessions()}
                  className="mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Sign Out All Sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
