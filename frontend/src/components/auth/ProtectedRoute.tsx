import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "../ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <LoadingState
        title="Loading your session"
        message="Checking your saved login and preparing your workspace."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
