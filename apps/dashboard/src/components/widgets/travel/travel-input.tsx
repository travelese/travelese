"use client";

import { TravelModal } from "@/components/travel/travel-modal";
import { Icons } from "@travelese/ui/icons";
import { SubmitButton } from "@travelese/ui/submit-button";
import { useState } from "react";

export function TravelInput() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
        <div className="relative z-20">
          <SubmitButton isSubmitting={false} onClick={handleOpenModal}>
            <Icons.LogoSmall />
          </SubmitButton>
          <TravelModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
      <div className="absolute h-[76px] bg-gradient-to-t from-background to-[#fff]/70 dark:to-[#121212]/90 bottom-0 left-0 right-0 w-full z-10" />
    </div>
  );
}
