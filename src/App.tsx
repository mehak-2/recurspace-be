import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useGetProfileQuery } from "./store/authApi";
import Auth from "./pages/Auth";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import WorkflowTracker from "./components/WorkflowTracker";
import Templates from "./components/Templates";
import AIOptimizer from "./components/AIOptimizer";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Billing from "./components/Billing";
import Notifications from "./components/Notifications";
import Integrations from "./components/Integrations";
import Security from "./components/Security";
import OAuthCallback from "./components/OAuthCallback";
import Sidebar from "./components/Sidebar";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const { isLoading, error } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token || error) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 ml-16 lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/oauth/callback/google-calendar"
          element={<OAuthCallback />}
        />
        <Route path="/oauth/callback/github" element={<OAuthCallback />} />
        <Route path="/oauth/callback/slack" element={<OAuthCallback />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflows"
          element={
            <ProtectedRoute>
              <WorkflowTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-optimizer"
          element={
            <ProtectedRoute>
              <AIOptimizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
