"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TriggerProvider } from "@/components/trigger-provider";
import { I18nProviderClient } from "@/locales/client";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import type { ReactNode } from "react";

if (isDesktopApp()) {
  require("@/desktop/main");
}

type ProviderProps = {
  locale: string;
  children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TriggerProvider accessToken={process.env.TRIGGER_PROJECT_ID!}>
          {children}
        </TriggerProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}
