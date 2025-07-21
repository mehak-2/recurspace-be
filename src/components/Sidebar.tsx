import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  RefreshCw,
  Brain,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  User,
  Bell,
  Link,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useGetProfileQuery } from "../store/authApi";
import { logout } from "../store/authSlice";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "tasks", label: "Tasks", icon: RefreshCw, path: "/tasks" },
  {
    id: "workflows",
    label: "Workflow Tracker",
    icon: RefreshCw,
    path: "/workflows",
  },
  {
    id: "templates",
    label: "Smart Templates",
    icon: FileText,
    path: "/templates",
  },
  {
    id: "ai-optimizer",
    label: "AI Optimizer",
    icon: Brain,
    path: "/ai-optimizer",
  },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link,
    path: "/integrations",
  },
  { id: "security", label: "Security", icon: Shield, path: "/security" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  { id: "billing", label: "Micro-Billing", icon: CreditCard, path: "/billing" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery(
    undefined,
    {
      skip: !token,
    }
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                RecurSpace
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profileLoading ? "Loading..." : profileData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profileLoading
                  ? "loading@example.com"
                  : profileData?.email || "user@example.com"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${collapsed ? "mx-auto" : ""}`}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
