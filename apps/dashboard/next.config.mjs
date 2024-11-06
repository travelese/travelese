import "./src/env.mjs";

import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import withVercelToolbar from "@vercel/toolbar/plugins/next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const config = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: [
    "@travelese/ui",
    "@travelese/jobs",
    "@travelese/tailwind",
    "@travelese/invoice",
  ],
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    instrumentationHook: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/((?!api/proxy).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

const nextConfig = withVercelToolbar()(
  withSentryConfig(withBundleAnalyzer(config), {
    silent: !process.env.CI,
    telemetry: false,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    tunnelRoute: "/monitoring",
  }),
);

export default nextConfig;
