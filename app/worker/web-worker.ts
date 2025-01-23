import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

let handler: WebWorkerMLCEngineHandler;

self.addEventListener("message", (_event) => {});

self.onmessage = (msg: MessageEvent): void => {
  if (!handler) {
    handler = new WebWorkerMLCEngineHandler();
    console.log("Web Worker: Web-LLM Engine Activated");
  }
  handler.onmessage(msg);
};
