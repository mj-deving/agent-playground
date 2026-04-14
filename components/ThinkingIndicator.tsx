"use client";

interface ThinkingIndicatorProps {
  message?: string;
}

export function ThinkingIndicator({ message }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
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
      <div className="flex flex-col gap-1.5">
        {message && (
          <span className="text-sm text-zinc-400">{message}</span>
        )}
        <div className="flex gap-1 items-center h-5">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
