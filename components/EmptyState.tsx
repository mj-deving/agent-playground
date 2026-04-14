"use client";

import { AgentMode } from "@/lib/types";

export function EmptyState({
  mode,
  onSuggestionClick,
}: {
  mode: AgentMode;
  onSuggestionClick: (topic: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-400"
        >
          <path
            d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h2
        className="text-xl font-semibold text-zinc-200 mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Agent Playground
      </h2>
      <p className="text-sm text-zinc-500 text-center max-w-md mb-8">
        Enter a research topic below and the agent will analyze it using{" "}
        {mode === "plan-reflect"
          ? "plan-and-reflect reasoning with iterative refinement"
          : "direct single-pass research"}
        .
      </p>
      <div className="grid gap-2 w-full max-w-md">
        {[
          "Compare transformer architectures for edge deployment",
          "State of autonomous agents in enterprise workflows",
          "RAG vs fine-tuning trade-offs for domain-specific LLMs",
        ].map((topic) => (
          <button
            key={topic}
            onClick={() => onSuggestionClick(topic)}
            className="group text-left px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all"
          >
            <span className="flex items-center justify-between">
              <span>{topic}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
