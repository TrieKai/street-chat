import { DEFAULT_MODELS } from "@/constants/llm";

export type Model = (typeof DEFAULT_MODELS)[number]["name"];

export enum CacheType {
  Cache = "cache",
  IndexDB = "index_db",
}

export const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
