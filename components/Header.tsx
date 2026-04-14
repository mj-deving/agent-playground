"use client";

import { AgentMode } from "@/lib/types";
import { AgentSelector } from "@/components/AgentSelector";

export function Header({
  mode,
  onModeChange,
  disabled,
  backendStatus,
  onNewConversation,
}: {
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled: boolean;
  backendStatus: "checking" | "healthy" | "unhealthy";
  onNewConversation: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold text-zinc-200" style={{ fontFamily: "var(--font-heading)" }}>
            Agent Playground
          </h1>
        </div>
        <AgentSelector mode={mode} onModeChange={onModeChange} disabled={disabled} />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${backendStatus === "healthy" ? "bg-emerald-400" : backendStatus === "unhealthy" ? "bg-red-400" : "bg-yellow-400 animate-pulse"}`} />
          <span className="text-xs text-zinc-500">
            {backendStatus === "healthy" ? "Backend connected" : backendStatus === "unhealthy" ? "Backend offline" : "Checking..."}
          </span>
        </div>
        <button onClick={onNewConversation} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 transition-colors" title="New conversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
