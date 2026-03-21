import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

type AuthState = "loading" | "authenticated" | "unauthenticated";

const ProtectedRoute = () => {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Phase 4: replace with Amplify auth check once amplify push is complete
      // const { getCurrentUser } = await import("aws-amplify/auth");
      // await getCurrentUser();
      // setAuthState("authenticated");

      // Temporary: check localStorage for a mock session flag
      const session = localStorage.getItem("biz_session");
      setAuthState(session ? "authenticated" : "unauthenticated");
    } catch {
      setAuthState("unauthenticated");
    }
  };

  if (authState === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    const isBizSubdomain = window.location.hostname.startsWith("biz.");
    return <Navigate to={isBizSubdomain ? "/" : "/biz/login"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
