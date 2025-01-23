import { CacheType } from "@/app/store/config";
import { DEFAULT_MODELS } from "@/constants/llm";

export type Model = (typeof DEFAULT_MODELS)[number]["name"];

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatConfig {
  stream: boolean;
  model: string;
  temperature?: number;
  top_p?: number;
  max_length?: number;
  cache?: CacheType;
}

export interface ChatOptions {
  messages: ChatMessage[];
  config: ChatConfig;
  onUpdate?: (message: string) => void;
  onFinish?: (message: string) => void;
  onError?: (error: any) => void;
}
