"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageProps {
  message: ChatMessageType;
}

function AgentAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-400"
      >
        <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="currentColor" />
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="text-zinc-300"
      >
        <path
          d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isAgent = message.role === "agent";

  return (
    <div
      className={`flex gap-3 px-4 py-4 animate-[fadeIn_0.3s_ease-out] ${
        isAgent ? "bg-zinc-900/30" : ""
      }`}
    >
      {isAgent ? <AgentAvatar /> : <UserAvatar />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-zinc-300">
            {isAgent ? "Research Agent" : "You"}
          </span>
          <span className="text-xs text-zinc-600">
            {formatTime(message.timestamp)}
          </span>
        </div>
        {isAgent ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <p className="text-zinc-200 text-sm leading-relaxed">
            {message.content}
          </p>
        )}
        {message.metadata && (
          <div className="flex gap-4 mt-3 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-500">
              {message.metadata.words.toLocaleString()} words
            </span>
            <span className="text-xs text-zinc-500">
              {message.metadata.elapsed.toFixed(1)}s
            </span>
            <span className="text-xs text-zinc-500 capitalize">
              {message.metadata.mode === "plan-reflect"
                ? "Plan + Reflect"
                : "Basic"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
