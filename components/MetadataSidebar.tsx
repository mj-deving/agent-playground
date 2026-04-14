"use client";

import { Conversation } from "@/lib/types";

interface MetadataSidebarProps {
  conversation: Conversation | null;
  onNewConversation: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  activeId: string | null;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MetadataSidebar({
  conversation,
  onNewConversation,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  activeId,
}: MetadataSidebarProps) {
  // Get last agent message metadata
  const lastAgentMsg = conversation?.messages
    .filter((m) => m.role === "agent")
    .pop();
  const meta = lastAgentMsg?.metadata;

  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/50 hidden lg:flex">
      {/* New conversation button */}
      <div className="p-3 border-b border-zinc-800">
        <button
          onClick={onNewConversation}
          className="w-full px-3 py-2 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-400"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Research
        </button>
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            History
          </p>
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-xs text-zinc-600 text-center">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                conv.id === activeId
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{conv.title}</p>
                <p className="text-xs text-zinc-600">
                  {formatDate(conv.createdAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                title="Delete"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Run stats */}
      {meta && (
        <div className="border-t border-zinc-800 p-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Last Run
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Words</span>
              <span className="text-zinc-300 font-mono">
                {meta.words.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Time</span>
              <span className="text-zinc-300 font-mono">
                {meta.elapsed.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Mode</span>
              <span className="text-zinc-300 font-mono capitalize">
                {meta.mode === "plan-reflect" ? "Plan+Reflect" : "Basic"}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
