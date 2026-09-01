"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@/design-system/Icon";

/**
 * The one shared add/edit form container for all seven direct sections —
 * bottom sheet on mobile, centered dialog on desktop, the same responsive
 * shape Monthly Money Reset's QuickAddModal/CheckInModal already
 * established (see docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md),
 * centralized here once instead of re-implemented per section the way MMR's
 * two modals each did independently. Focus moves to the first field on
 * open, Escape closes, and focus returns to the control that opened it —
 * mirrors src/design-system/MobileSheet.tsx's accessibility handling,
 * which itself only covers the mobile breakpoint and can't be reused
 * directly here since this needs a real desktop dialog too.
 */
export default function RecordFormSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const firstField = panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button");
    firstField?.focus();
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

  // Portalled to document.body for the same containing-block reason
  // MobileSheet.tsx documents (a fixed descendant of a backdrop-blur
  // ancestor positions relative to that ancestor, not the viewport).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-form-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-5 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[shadow:var(--shadow-md)] sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p id="record-form-title" className="text-[16px] font-semibold text-[var(--text)]">
              {title}
            </p>
            {description && <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            <X size={17} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
        <div className="mt-6 flex items-center justify-end gap-2.5">{footer}</div>
      </div>
    </div>,
    document.body
  );
}
