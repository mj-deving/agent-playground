"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AgentMode } from "@/lib/types";
import { useResearchAgent } from "@/hooks/useResearchAgent";
import { AgentSelector } from "@/components/AgentSelector";
import { ChatMessageComponent } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function PlaygroundPage() {
  const [mode, setMode] = useState<AgentMode>("basic");
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "healthy" | "unhealthy"
  >("checking");

  const {
    state,
    activeConversation,
    sendResearch,
    cancelResearch,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useResearchAgent();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        setBackendStatus(res.ok ? "healthy" : "unhealthy");
      } catch {
        setBackendStatus("unhealthy");
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    activeConversation?.messages,
    state.streamingContent,
    state.statusMessage,
  ]);

  const handleSend = useCallback(
    (message: string) => {
      if (!state.activeConversationId) {
        newConversation(mode);
      }
      // Small delay to ensure conversation is created
      setTimeout(() => {
        sendResearch(message, mode);
      }, 50);
    },
    [mode, state.activeConversationId, newConversation, sendResearch]
  );

  const handleNewConversation = useCallback(() => {
    newConversation(mode);
  }, [mode, newConversation]);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <MetadataSidebar
        conversation={activeConversation}
        onNewConversation={handleNewConversation}
        conversations={state.conversations}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        activeId={state.activeConversationId}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
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
              <h1
                className="text-sm font-semibold text-zinc-200"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Agent Playground
              </h1>
            </div>
            <AgentSelector
              mode={mode}
              onModeChange={setMode}
              disabled={state.isStreaming}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Backend status indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "healthy"
                    ? "bg-emerald-400"
                    : backendStatus === "unhealthy"
                      ? "bg-red-400"
                      : "bg-yellow-400 animate-pulse"
                }`}
              />
              <span className="text-xs text-zinc-500">
                {backendStatus === "healthy"
                  ? "Backend connected"
                  : backendStatus === "unhealthy"
                    ? "Backend offline"
                    : "Checking..."}
              </span>
            </div>

            {/* Mobile: new conversation */}
            <button
              onClick={handleNewConversation}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="New conversation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation ||
          activeConversation.messages.length === 0 ? (
            <EmptyState mode={mode} onSuggestionClick={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto">
              {activeConversation.messages.map((msg) => (
                <ChatMessageComponent key={msg.id} message={msg} />
              ))}

              {/* Streaming content */}
              {state.isStreaming && state.statusMessage && (
                <ThinkingIndicator message={state.statusMessage} />
              )}

              {state.isStreaming && state.streamingContent && (
                <div className="flex gap-3 px-4 py-4 bg-zinc-900/30 animate-[fadeIn_0.3s_ease-out]">
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
                    <MarkdownRenderer content={state.streamingContent} />
                  </div>
                </div>
              )}

              {state.isStreaming &&
                !state.streamingContent &&
                !state.statusMessage && (
                  <ThinkingIndicator />
                )}
            </div>
          )}

          {/* Error display */}
          {state.error && (
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{state.error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onCancel={cancelResearch}
          disabled={state.isStreaming}
          isStreaming={state.isStreaming}
        />
      </div>
    </div>
  );
}

function EmptyState({
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
            className="text-left px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
