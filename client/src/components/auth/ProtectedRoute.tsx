import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoaderCircle } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();

  const location = useLocation();

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <LoaderCircle
            size={30}
            className="mx-auto animate-spin text-indigo-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Restoring your DeployPulse session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
