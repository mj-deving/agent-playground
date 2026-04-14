export type AgentMode = "basic" | "plan-reflect";

export interface ResearchRequest {
  topic: string;
  mode: AgentMode;
}

export interface StreamEvent {
  type: "status" | "chunk" | "metadata" | "error" | "done";
  data: string;
}

export interface MessageMetadata {
  words: number;
  elapsed: number;
  mode: AgentMode;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  mode: AgentMode;
}

export type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  statusMessage: string;
  error: string | null;
};

export type ChatAction =
  | { type: "NEW_CONVERSATION"; mode: AgentMode }
  | { type: "SELECT_CONVERSATION"; id: string }
  | { type: "DELETE_CONVERSATION"; id: string }
  | { type: "ADD_USER_MESSAGE"; content: string }
  | { type: "START_STREAMING" }
  | { type: "SET_STATUS"; message: string }
  | { type: "APPEND_CHUNK"; chunk: string }
  | { type: "FINISH_STREAMING"; metadata?: MessageMetadata }
  | { type: "FINISH_STREAMING_IF_NEEDED"; metadata?: MessageMetadata }
  | { type: "SET_ERROR"; error: string }
  | { type: "LOAD_CONVERSATIONS"; conversations: Conversation[] };
