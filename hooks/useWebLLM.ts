import { useEffect, useRef, useState, useCallback } from "react";
import { ServiceWorkerMLCEngine } from "@mlc-ai/web-llm";
import { WebLLMApi } from "@/app/client/webllm";
import { useLLMConfigStore } from "@/app/store/llmConfigStore";
import type { RequestMessage } from "@/app/client/api";

export const useWebLLM = () => {
  const [webLLM, setWebLLM] = useState<WebLLMApi>();
  const [isWebLLMActive, setWebLLMAlive] = useState(false);

  const isWebLLMInitialized = useRef(false);

  // If service worker registration timeout, fall back to web worker
  const serviceWorkerTimeout = setTimeout(() => {
    if (!isWebLLMInitialized.current && !isWebLLMActive && !webLLM) {
      console.log(
        "Service Worker activation is timed out. Falling back to use web worker."
      );
      setWebLLM(new WebLLMApi("webWorker"));
      setWebLLMAlive(true);
    }
  }, 2_000);

  // Initialize WebLLM engine
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log("Service Worker API is available and in use.");
      navigator.serviceWorker.ready.then(() => {
        console.log("Service Worker is activated.");
        // Check whether WebGPU is available in Service Worker
        const request = {
          kind: "checkWebGPUAvilability",
          uuid: crypto.randomUUID(),
          content: "",
        };

        const sendEventInterval = setInterval(() => {
          navigator.serviceWorker.controller?.postMessage(request);
        }, 200);

        const webGPUCheckCallback = (event: MessageEvent): void => {
          const message = event.data;
          if (message.kind === "return" && message.uuid === request.uuid) {
            const isWebGPUAvailable = message.content;
            console.log(
              isWebGPUAvailable
                ? "Service Worker has WebGPU Available."
                : "Service Worker does not have available WebGPU."
            );
            if (!webLLM && !isWebLLMActive) {
              setWebLLM(
                new WebLLMApi(isWebGPUAvailable ? "serviceWorker" : "webWorker")
              );
              setWebLLMAlive(true);
              isWebLLMInitialized.current = true;
              clearTimeout(serviceWorkerTimeout);
            }
            navigator.serviceWorker.removeEventListener(
              "message",
              webGPUCheckCallback
            );
            clearInterval(sendEventInterval);
          }
        };
        navigator.serviceWorker.addEventListener(
          "message",
          webGPUCheckCallback
        );
      });
    } else {
      console.log(
        "Service Worker API is unavailable. Falling back to use web worker."
      );
      setWebLLM(new WebLLMApi("webWorker"));
      setWebLLMAlive(true);
      isWebLLMInitialized.current = true;
      clearTimeout(serviceWorkerTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { llmConfig } = useLLMConfigStore();

  const chat = useCallback(
    async ({
      messages,
      onUpdate,
      onFinish,
      onError,
    }: {
      messages: RequestMessage[];
      onUpdate?: (message: string) => void;
      onFinish?: (message: string) => void;
      onError?: (error: any) => void;
    }): Promise<void> => {
      if (!webLLM) {
        onError?.("WebLLM not initialized");
        return;
      }

      try {
        await webLLM.chat({
          messages,
          config: {
            stream: true,
            ...llmConfig,
          },
          onUpdate(message) {
            onUpdate?.(message);
          },
          onFinish(message) {
            onFinish?.(message);
          },
          onError(err) {
            onError?.(err);
          },
        });
      } catch (error) {
        onError?.(error);
      }
    },
    [llmConfig, webLLM]
  );

  if (webLLM?.webLLMHandler.type === "serviceWorker") {
    setInterval(() => {
      if (webLLM) {
        // 10s per heartbeat, dead after 30 seconds of inactivity
        setWebLLMAlive(
          !!webLLM.webLLMHandler.engine &&
            (webLLM.webLLMHandler.engine as ServiceWorkerMLCEngine)
              .missedHeatbeat < 3
        );
      }
    }, 10_000);
  }

  return {
    webLLM,
    isWebLLMActive,
    chat,
  };
};
