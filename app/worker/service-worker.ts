import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";
import { defaultCache } from "@serwist/next/worker";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare const self: ServiceWorkerGlobalScope;
const WEB_LLM_WEB_CACHE = "web-llm-cache";
let handler: ServiceWorkerMLCEngineHandler;

const checkGPUAvailability = async () => {
  if (!("gpu" in navigator)) {
    console.log("Service Worker: Web-LLM Engine Activated");
    return false;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log("Service Worker: Web-LLM Engine Activated");
    return false;
  }
  return true;
};

self.addEventListener("message", (event) => {
  if (!handler) {
    handler = new ServiceWorkerMLCEngineHandler();
    console.log("Service Worker: Web-LLM Engine Activated");
  }

  const msg = event.data;
  if (msg.kind === "checkWebGPUAvailability") {
    console.log("Service Worker: Web-LLM Engine Activated");
    checkGPUAvailability().then((gpuAvailable) => {
      console.log(
        "Service Worker: WebGPU is " +
          (gpuAvailable ? "available" : "unavailable")
      );
      const reply = {
        kind: "return",
        uuid: msg.uuid,
        content: gpuAvailable,
      };
      event.source?.postMessage(reply);
    });
  }
});

self.addEventListener("install", (event) => {
  // Always update right away
  self.skipWaiting();

  event.waitUntil(
    caches.open(WEB_LLM_WEB_CACHE).then((cache) => {
      return cache.addAll([]);
    })
  );
});

self.addEventListener("activate", (_event) => {
  if (!handler) {
    handler = new ServiceWorkerMLCEngineHandler();
    console.log("Service Worker: Web-LLM Engine Activated");
  }
});

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin && pathname === "/ping.txt",
      handler: new CacheFirst({
        cacheName: "WebLLMChatServiceWorkerKeepAlive",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
