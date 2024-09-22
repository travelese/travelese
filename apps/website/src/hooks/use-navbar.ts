import { useState, useEffect } from "react";

export function useNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleCommand = () => setCommandOpen(!commandOpen);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommand();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommand]);

  return { isOpen, toggleOpen, commandOpen, toggleCommand };
}
