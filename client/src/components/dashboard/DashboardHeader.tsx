import { Activity, LogOut } from "lucide-react";

import type { User } from "../../types/user";

type DashboardHeaderProps = {
  user: User;
  loggingOut: boolean;
  onLogout: () => Promise<void>;
};

function DashboardHeader({ user, loggingOut, onLogout }: DashboardHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <Activity size={24} />
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-400">
              Deployment monitoring
            </p>

            <h1 className="text-2xl font-bold text-white">DeployPulse</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
          <div className="flex min-w-0 items-center gap-3 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">
              {initials || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>

              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={loggingOut}
            onClick={() => void onLogout()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={17} />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
