import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

export default withSerwistInit({
  swSrc: "app/worker/service-worker.ts",
  swDest: "public/sw.js",
})(nextConfig);
