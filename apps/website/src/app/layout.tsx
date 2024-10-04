import { DevMessage } from "@/components/dev-message";
import { Footer } from "@/components/footer";
import { FooterCTA } from "@/components/footer-cta";
import { Header } from "@/components/header";
import "@/styles/globals.css";
import { Provider as Analytics } from "@travelese/events/client";
import { cn } from "@travelese/ui/cn";
import "@travelese/ui/globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { baseUrl } from "./sitemap";

export const preferredRegion = ["fra1", "sfo1", "iad1"];

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Travelese | Traveller Experience Management",
    template: "%s | Travelese",
  },
  description:
    "Travelese provides you with greater insight into your traveller experience and automates the boring tasks, allowing you to focus on what you love to do instead.",
  openGraph: {
    title: "Travelese | Traveller Experience Management",
    description: "This is my portfolio.",
    url: baseUrl,
    siteName:
      "Travelese provides you with greater insight into your traveller experience and automates the boring tasks, allowing you to focus on what you love to do instead.",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cdn.travelese.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.travelese.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Travelese | Traveller Experience Management",
    description: "This is my portfolio.",
    images: [
      {
        url: "https://cdn.travelese.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.travelese.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)" }],
};

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable}`,
          "bg-[#0C0C0C] overflow-x-hidden dark antialiased",
        )}
      >
        <Header />
        <main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
          {children}
        </main>
        <FooterCTA />
        <Footer />
        <Analytics />
        <DevMessage />
      </body>
    </html>
  );
}
