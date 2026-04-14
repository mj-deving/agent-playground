"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AgentMode } from "@/lib/types";
import { useResearchAgent } from "@/hooks/useResearchAgent";
import { ChatMessageComponent } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { EmptyState } from "@/components/EmptyState";
import { StreamingDisplay } from "@/components/StreamingDisplay";
import { Header } from "@/components/Header";

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
      <MetadataSidebar
        conversation={activeConversation}
        onNewConversation={handleNewConversation}
        conversations={state.conversations}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        activeId={state.activeConversationId}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header mode={mode} onModeChange={setMode} disabled={state.isStreaming} backendStatus={backendStatus} onNewConversation={handleNewConversation} />

        <div className="flex-1 overflow-y-auto" aria-live="polite">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <EmptyState mode={mode} onSuggestionClick={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto">
              {activeConversation.messages.map((msg) => (
                <ChatMessageComponent key={msg.id} message={msg} />
              ))}
              {state.isStreaming && state.statusMessage && <ThinkingIndicator message={state.statusMessage} />}
              {state.isStreaming && state.streamingContent && <StreamingDisplay streamingContent={state.streamingContent} />}
              {state.isStreaming && !state.streamingContent && !state.statusMessage && <ThinkingIndicator />}
            </div>
          )}
          {state.error && (
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{state.error}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSend} onCancel={cancelResearch} disabled={state.isStreaming} isStreaming={state.isStreaming} />
      </main>
    </div>
  );
}
