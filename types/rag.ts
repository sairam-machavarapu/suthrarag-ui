export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model: string;
}

export interface ChatMetadata {
  retrieved_chunks: number;
  token_usage: TokenUsage;
}

export interface DocumentSource {
  documentName: string;
  chunkNumber: number;
}

export interface ChatResponse {
  answer: string;
  sources: DocumentSource[];
  metadata: ChatMetadata;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: DocumentSource[];
  metadata?: ChatMetadata;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}
