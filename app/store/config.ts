import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODELS, ModelFamily } from "@/constants/llm";
import type { Model } from "@/types/llm";

export enum CacheType {
  Cache = "cache",
  IndexedDB = "indexed_db",
}

export const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export interface LLMConfig {
  model: Model;
  temperature: number;
  topP: number;
  maxLength: number;
  cache: CacheType;
}

interface ConfigState {
  llmConfig: LLMConfig;
  updateLLMConfig: (config: Partial<LLMConfig>) => void;
}

const DEFAULT_CONFIG: LLMConfig = {
  model: DEFAULT_MODEL,
  temperature: 0.7,
  topP: 1,
  maxLength: 4000,
  cache: CacheType.Cache,
};

// Group models by family
export const MODEL_FAMILIES = Object.values(ModelFamily).map((family) => ({
  family,
  models: DEFAULT_MODELS.filter((model) => model.family === family),
}));

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      llmConfig: DEFAULT_CONFIG,
      updateLLMConfig: (config) =>
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),
    }),
    {
      name: "llm-config",
    }
  )
);
