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
    process.env.NEXT_PUBLIC_BASE_URL || "https://street-chat.vercel.app/"
  ),
  title: "Street Chat - Real-time 3D Street Communication",
  description:
    "Experience real-time 3D street chat with immersive communication and interactive features. Connect with others in a virtual street environment.",
  keywords: [
    "street chat",
    "3D chat",
    "real-time communication",
    "virtual street",
    "social platform",
  ],
  authors: [{ name: "Street Chat Team" }],
  openGraph: {
    title: "Street Chat - Real-time 3D Street Communication",
    description:
      "Experience real-time 3D street chat with immersive communication and interactive features",
    images: ["/street-chat.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Street Chat - Real-time 3D Street Communication",
    description:
      "Experience real-time 3D street chat with immersive communication and interactive features",
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
        <meta name="application-name" content="Street Chat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Street Chat" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
