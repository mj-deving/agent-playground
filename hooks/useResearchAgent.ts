"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import {
  ChatState,
  ChatAction,
  AgentMode,
  ChatMessage,
  MessageMetadata,
  Conversation,
} from "@/lib/types";
import { loadConversations, saveConversations } from "@/lib/storage";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getActiveConversation(state: ChatState): Conversation | null {
  if (!state.activeConversationId) return null;
  return (
    state.conversations.find((c) => c.id === state.activeConversationId) ?? null
  );
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "LOAD_CONVERSATIONS":
      return {
        ...state,
        conversations: action.conversations,
        activeConversationId:
          action.conversations.length > 0
            ? action.conversations[0].id
            : null,
      };

    case "NEW_CONVERSATION": {
      const conv: Conversation = {
        id: generateId(),
        title: "New Research",
        messages: [],
        createdAt: Date.now(),
        mode: action.mode,
      };
      return {
        ...state,
        conversations: [conv, ...state.conversations],
        activeConversationId: conv.id,
        error: null,
        streamingContent: "",
        statusMessage: "",
      };
    }

    case "SELECT_CONVERSATION":
      return {
        ...state,
        activeConversationId: action.id,
        error: null,
        streamingContent: "",
        statusMessage: "",
        isStreaming: false,
      };

    case "DELETE_CONVERSATION": {
      const filtered = state.conversations.filter((c) => c.id !== action.id);
      return {
        ...state,
        conversations: filtered,
        activeConversationId:
          state.activeConversationId === action.id
            ? filtered[0]?.id ?? null
            : state.activeConversationId,
      };
    }

    case "ADD_USER_MESSAGE": {
      const msg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: action.content,
        timestamp: Date.now(),
      };
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === state.activeConversationId
            ? {
                ...c,
                title:
                  c.messages.length === 0
                    ? action.content.slice(0, 60)
                    : c.title,
                messages: [...c.messages, msg],
              }
            : c
        ),
      };
    }

    case "START_STREAMING":
      return {
        ...state,
        isStreaming: true,
        streamingContent: "",
        statusMessage: "Connecting to agent...",
        error: null,
      };

    case "SET_STATUS":
      return { ...state, statusMessage: action.message };

    case "APPEND_CHUNK":
      return {
        ...state,
        streamingContent: state.streamingContent + action.chunk,
        statusMessage: "",
      };

    case "FINISH_STREAMING": {
      const agentMsg: ChatMessage = {
        id: generateId(),
        role: "agent",
        content: state.streamingContent,
        timestamp: Date.now(),
        metadata: action.metadata,
      };
      return {
        ...state,
        isStreaming: false,
        streamingContent: "",
        statusMessage: "",
        conversations: state.conversations.map((c) =>
          c.id === state.activeConversationId
            ? { ...c, messages: [...c.messages, agentMsg] }
            : c
        ),
      };
    }

    case "FINISH_STREAMING_IF_NEEDED":
      // Only finish if still streaming (metadata event may have already handled it)
      if (!state.isStreaming) return state;
      return chatReducer(state, {
        type: "FINISH_STREAMING",
        metadata: action.metadata,
      });

    case "SET_ERROR":
      return {
        ...state,
        isStreaming: false,
        statusMessage: "",
        error: action.error,
      };

    default:
      return state;
  }
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  streamingContent: "",
  statusMessage: "",
  error: null,
};

export function useResearchAgent() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = loadConversations();
    if (saved.length > 0) {
      dispatch({ type: "LOAD_CONVERSATIONS", conversations: saved });
    }
  }, []);

  // Persist conversations on change
  useEffect(() => {
    if (state.conversations.length > 0) {
      saveConversations(state.conversations);
    }
  }, [state.conversations]);

  const activeConversation = getActiveConversation(state);

  const sendResearch = useCallback(
    async (topic: string, mode: AgentMode) => {
      // Ensure we have an active conversation — dispatch and let reducer
      // handle both creation + message in a predictable sequence
      if (!state.activeConversationId) {
        dispatch({ type: "NEW_CONVERSATION", mode });
        // NEW_CONVERSATION sets activeConversationId synchronously in the
        // reducer, so the next dispatch picks it up within the same batch
      }

      dispatch({ type: "ADD_USER_MESSAGE", content: topic });
      dispatch({ type: "START_STREAMING" });

      const startTime = Date.now();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, mode }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Research failed (${response.status}): ${errorText}`
          );
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const eventBoundary = buffer.lastIndexOf("\n\n");
          if (eventBoundary === -1) continue;

          const complete = buffer.slice(0, eventBoundary);
          buffer = buffer.slice(eventBoundary + 2);

          const events = complete.split("\n\n");
          for (const eventBlock of events) {
            const lines = eventBlock.split("\n");
            let eventType = "message";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7);
              } else if (line.startsWith("data: ")) {
                eventData += line.slice(6);
              }
            }

            if (!eventData) continue;

            try {
              const parsed = JSON.parse(eventData);

              switch (eventType) {
                case "status":
                  dispatch({ type: "SET_STATUS", message: parsed.message });
                  break;
                case "chunk":
                  dispatch({ type: "APPEND_CHUNK", chunk: parsed.content });
                  break;
                case "metadata": {
                  const elapsed = (Date.now() - startTime) / 1000;
                  const metadata: MessageMetadata = {
                    words: parsed.words ?? 0,
                    elapsed,
                    mode,
                  };
                  dispatch({ type: "FINISH_STREAMING", metadata });
                  break;
                }
                case "error":
                  dispatch({
                    type: "SET_ERROR",
                    error: parsed.message ?? "Unknown error",
                  });
                  break;
                case "done":
                  // Handled by metadata event
                  break;
              }
            } catch {
              // Non-JSON event data, treat as chunk
              dispatch({ type: "APPEND_CHUNK", chunk: eventData });
            }
          }
        }

        // If stream ended without metadata event, finish with fallback
        const elapsed = (Date.now() - startTime) / 1000;
        dispatch({
          type: "FINISH_STREAMING_IF_NEEDED",
          metadata: { words: 0, elapsed, mode },
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          dispatch({ type: "SET_ERROR", error: "Research cancelled" });
        } else {
          dispatch({
            type: "SET_ERROR",
            error:
              err instanceof Error ? err.message : "An unknown error occurred",
          });
        }
      } finally {
        abortRef.current = null;
      }
    },
    [state.activeConversationId, state.isStreaming]
  );

  const cancelResearch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const newConversation = useCallback((mode: AgentMode) => {
    dispatch({ type: "NEW_CONVERSATION", mode });
  }, []);

  const selectConversation = useCallback((id: string) => {
    dispatch({ type: "SELECT_CONVERSATION", id });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: "DELETE_CONVERSATION", id });
  }, []);

  return {
    state,
    activeConversation,
    sendResearch,
    cancelResearch,
    newConversation,
    selectConversation,
    deleteConversation,
  };
}
