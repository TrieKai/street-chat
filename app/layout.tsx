import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://street-chat.vercel.app"
  ),
  title: "Street Chat - Real-time 3D Street View Chat with Local AI",
  description:
    "Experience real-time 3D street view chatting with built-in AI powered by WebGPU. Chat with AI locally in your browser while exploring street views with others.",
  keywords: [
    "street view chat",
    "real-time chat",
    "WebGPU",
    "AI chat",
    "local LLM",
    "web-llm",
    "3D chat",
    "browser AI",
    "privacy focused chat",
  ],
  authors: [{ name: "Trie Chen" }],
  openGraph: {
    title: "Street Chat - Real-time 3D Street View Chat with Local AI",
    description:
      "Experience real-time 3D street view chatting with built-in AI powered by WebGPU. Chat with AI locally in your browser while exploring street views with others.",
    images: ["/street-chat.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Street Chat - Real-time 3D Street View Chat with Local AI",
    description:
      "Experience real-time 3D street view chatting with built-in AI powered by WebGPU. Chat with AI locally in your browser while exploring street views with others.",
    images: ["/street-chat.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/mapillary-js@4.1.2/dist/mapillary.css"
          rel="stylesheet"
        />
        <link rel="icon" href="/street-chat.png" />
        <link rel="apple-touch-icon" href="/street-chat.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Street Chat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Street Chat" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
