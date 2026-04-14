"use client";

import { AgentMode } from "@/lib/types";

interface AgentSelectorProps {
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled: boolean;
}

export function AgentSelector({
  mode,
  onModeChange,
  disabled,
}: AgentSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
      <button
        onClick={() => onModeChange("basic")}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm rounded-md transition-all ${
          mode === "basic"
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            : "text-zinc-400 hover:text-zinc-300 border border-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        Basic Research
      </button>
      <button
        onClick={() => onModeChange("plan-reflect")}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm rounded-md transition-all ${
          mode === "plan-reflect"
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            : "text-zinc-400 hover:text-zinc-300 border border-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        Plan + Reflect
      </button>
    </div>
  );
}
