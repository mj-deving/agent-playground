"use client";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export function StreamingDisplay({
  streamingContent,
}: {
  streamingContent: string;
}) {
  return (
    <div
      className="flex gap-3 px-4 py-4 bg-zinc-900/30 animate-[fadeIn_0.3s_ease-out]"
      aria-live="polite"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
        <svg
          width="16"
          height="16"
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-zinc-300">
            Research Agent
          </span>
          <span className="text-xs text-blue-400 animate-pulse">
            streaming
          </span>
        </div>
        <MarkdownRenderer content={streamingContent} />
      </div>
    </div>
  );
}
