import { useEffect, useState } from "react";

export function useKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        setIsOpen(true);
      }
    };

    const handleFocusOut = () => {
      // delay avoids flicker when switching inputs
      setTimeout(() => {
        // only close if no input is focused
        const active = document.activeElement;
        if (
          !active ||
          (active.tagName !== "INPUT" &&
            active.tagName !== "TEXTAREA" &&
            !(active instanceof HTMLElement && active.isContentEditable))
        ) {
          setIsOpen(false);
        }
      }, 150);
    };

    // IMPORTANT: document + capture
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
    };
  }, []);

  return isOpen;
}
