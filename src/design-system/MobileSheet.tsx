"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "./Icon";

/**
 * The shared bottom-sheet chrome for mobile utility surfaces (account menu,
 * product "More" menu), the same overlay/panel shape already established
 * by QuickAddModal/CheckInModal, extracted so every mobile sheet in the app
 * shares one implementation of focus handling, Escape-to-close, and
 * safe-area padding instead of each screen reimplementing it slightly
 * differently.
 */
export default function MobileSheet({
  open,
  onClose,
  title,
  children,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Focus returns here when the sheet closes: the button that opened it. */
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef?.current?.focus();
    }
  }, [open, triggerRef]);

  if (!mounted || !open) return null;

  // Portalled to document.body: a `fixed inset-0` child of any ancestor with
  // its own transform/filter/backdrop-filter (several of this app's sticky
  // headers use backdrop-blur) is positioned relative to that ancestor, not
  // the viewport, per the CSS containing-block spec. GuidedTour.tsx already
  // works around this the same way, see there for the same reasoning.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-sheet-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-5 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[var(--shadow-md)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p id="mobile-sheet-title" className="text-[15px] font-semibold text-[var(--text)]">
            {title}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
