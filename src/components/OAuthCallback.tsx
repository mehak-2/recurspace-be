import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  useLazyGoogleCalendarAuthQuery,
  useLazyGithubIntegrationAuthQuery,
  useLazySlackIntegrationAuthQuery,
} from "../store/oauthApi";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const [googleCalendarAuth] = useLazyGoogleCalendarAuthQuery();
  const [githubIntegrationAuth] = useLazyGithubIntegrationAuthQuery();
  const [slackIntegrationAuth] = useLazySlackIntegrationAuthQuery();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage(`OAuth error: ${error}`);
          return;
        }

        if (!code) {
          setStatus("error");
          setMessage("No authorization code received");
          return;
        }

        // Determine which integration based on the URL path or state
        const path = window.location.pathname;
        let authResult;

        if (path.includes("google-calendar")) {
          authResult = await googleCalendarAuth({ code }).unwrap();
        } else if (path.includes("github")) {
          authResult = await githubIntegrationAuth({ code }).unwrap();
        } else if (path.includes("slack")) {
          authResult = await slackIntegrationAuth({ code }).unwrap();
        } else {
          setStatus("error");
          setMessage("Unknown OAuth provider");
          return;
        }

        if (authResult.success) {
          setStatus("success");
          setMessage(
            authResult.message || "Integration connected successfully!"
          );

          // Redirect back to integrations page after 2 seconds
          setTimeout(() => {
            navigate("/integrations");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(authResult.message || "Failed to connect integration");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setMessage("Failed to complete OAuth flow");
      }
    };

    handleOAuthCallback();
  }, [
    searchParams,
    navigate,
    googleCalendarAuth,
    githubIntegrationAuth,
    slackIntegrationAuth,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing OAuth...
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your integration setup.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to integrations page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/integrations")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Integrations
            </button>
          </>
        )}
      </div>
    </div>
  );
}
