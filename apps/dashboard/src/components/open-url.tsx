"use client";

import { platform } from "@todesktop/client-core";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import { cn } from "@travelese/ui/cn";

export function OpenURL({
  href,
  children,
  className,
}: { href: string; children: React.ReactNode; className?: string }) {
  const handleOnClick = () => {
    if (isDesktopApp()) {
      platform.os.openURL(href);
    } else {
      window.open(href, "_blank");
    }
  };

  return (
    <span onClick={handleOnClick} className={cn("cursor-pointer", className)}>
      {children}
    </span>
  );
}
