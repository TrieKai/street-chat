import { create } from "zustand";
import { CacheType, DEFAULT_MODEL, Model } from "./config";

interface LLMStore {
  model: Model;
  setModel: (model: Model) => void;
  temperature: number;
  setTemperature: (temperature: number) => void;
  presence_penalty: number;
  setPresencePenalty: (penalty: number) => void;
  frequency_penalty: number;
  setFrequencyPenalty: (penalty: number) => void;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  topP: number;
  setTopP: (p: number) => void;
  cache: CacheType;
  setCache: (cache: CacheType) => void;
}

export const useLLMStore = create<LLMStore>((set) => ({
  model: DEFAULT_MODEL,
  setModel: (model) => set({ model }),
  temperature: 0.7,
  setTemperature: (temperature) => set({ temperature }),
  presence_penalty: 0,
  setPresencePenalty: (penalty) => set({ presence_penalty: penalty }),
  frequency_penalty: 0,
  setFrequencyPenalty: (penalty) => set({ frequency_penalty: penalty }),
  maxTokens: 4000,
  setMaxTokens: (tokens) => set({ maxTokens: tokens }),
  topP: 1,
  setTopP: (p) => set({ topP: p }),
  cache: CacheType.Cache,
  setCache: (cache) => set({ cache }),
}));
