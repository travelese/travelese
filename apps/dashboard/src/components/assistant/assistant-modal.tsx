"use client";

import { useAssistantStore } from "@/store/assistant";
import { Dialog, DialogContent } from "@travelese/ui/dialog";
import { useHotkeys } from "react-hotkeys-hook";
import { Assistant } from ".";

export function AssistantModal() {
  const { isOpen, setOpen, isMaximized } = useAssistantStore();

  useHotkeys("meta+k", () => setOpen(), {
    enableOnFormTags: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className={`overflow-hidden p-0 select-text ${
          isMaximized
            ? "w-screen h-screen max-w-none m-0"
            : "max-w-full w-full h-full md:max-w-[740px] md:h-[480px] m-0"
        }`}
        hideClose
      >
        <Assistant />
      </DialogContent>
    </Dialog>
  );
}
