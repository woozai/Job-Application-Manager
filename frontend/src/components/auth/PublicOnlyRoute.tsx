import { Navigate, Outlet } from "react-router-dom";

import { LoadingState } from "../ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <LoadingState
        title="Loading your session"
        message="Checking whether you are already signed in."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}
