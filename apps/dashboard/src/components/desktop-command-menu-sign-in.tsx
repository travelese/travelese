"use client";

import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";

export function DesktopCommandMenuSignIn() {
  return (
    <div className="flex h-full flex-col">
      <Icons.Logo className="absolute top-8 left-8" />

      <div className="flex items-center w-full justify-center h-full">
        <a href="travelese://">
          <Button variant="outline">Login to Travelese</Button>
        </a>
      </div>
    </div>
  );
}
