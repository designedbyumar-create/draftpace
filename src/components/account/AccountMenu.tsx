"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/design-system/Avatar";
import MobileSheet from "@/design-system/MobileSheet";
import type { DraftpaceIcon } from "@/design-system/Icon";

export type AccountMenuItem = {
  key: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  icon: DraftpaceIcon;
  tone?: "default" | "danger";
};

/**
 * The one signed-in account menu, reused as-is by the authenticated app
 * shell (PlatformShell, ProductShell) and both public-header states,
 * different item lists (see accountMenuItems.ts), same component, so
 * there's exactly one place that owns trigger/panel behavior, keyboard
 * handling, and focus return. Renders both a desktop anchored dropdown and
 * a mobile bottom sheet from the same `items`; CSS breakpoints decide which
 * is visible, so callers mount this once and get both for free.
 */
export default function AccountMenu({
  items,
  label,
  renderMobileTrigger,
  only,
}: {
  items: AccountMenuItem[];
  label: string;
  /**
   * Overrides the mobile trigger's appearance (e.g. to match sibling items
   * in a bottom-navigation bar) while reusing the same underlying sheet and
   * item list. The caller must attach the given `ref` to its trigger
   * element so MobileSheet can return focus to it on close. Defaults to a
   * plain avatar button when omitted.
   */
  renderMobileTrigger?: (props: {
    onClick: () => void;
    isOpen: boolean;
    ref: React.RefObject<HTMLButtonElement | null>;
  }) => React.ReactNode;
  /**
   * Renders just one trigger instead of both. Needed when a shell's mobile
   * and desktop layouts are two genuinely different rows (not one row that
   * CSS reshapes) and each row mounts its own AccountMenu, without this
   * every mount would duplicate the other breakpoint's trigger and sheet
   * into the DOM even though CSS keeps it invisible there. Omit when a
   * single mount already sits somewhere valid at both breakpoints.
   */
  only?: "desktop" | "mobile";
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeDesktopMenu() {
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <>
      {only !== "mobile" && (
        <details ref={detailsRef} className="group relative hidden lg:block">
          <summary
            className="flex cursor-pointer list-none items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] [&::-webkit-details-marker]:hidden"
            aria-label={`Account menu for ${label}`}
          >
            <Avatar label={label} size="sm" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 min-w-[216px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[shadow:var(--shadow-soft)]">
            {items.map((item) => (
              <AccountMenuRow key={item.key} item={item} onSelect={closeDesktopMenu} />
            ))}
          </div>
        </details>
      )}

      {only !== "desktop" && (
        <>
          {renderMobileTrigger ? (
            <span className="contents lg:hidden">
              {renderMobileTrigger({ onClick: () => setSheetOpen(true), isOpen: sheetOpen, ref: mobileTriggerRef })}
            </span>
          ) : (
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={`Account menu for ${label}`}
              className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
            >
              <Avatar label={label} size="sm" />
            </button>
          )}
          <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Account" triggerRef={mobileTriggerRef}>
            <p className="mb-2 truncate px-3 text-[12px] font-semibold text-[var(--muted)]">{label}</p>
            <div className="flex flex-col gap-0.5">
              {items.map((item) => (
                <AccountMenuRow key={item.key} item={item} onSelect={() => setSheetOpen(false)} />
              ))}
            </div>
          </MobileSheet>
        </>
      )}
    </>
  );
}

function AccountMenuRow({ item, onSelect }: { item: AccountMenuItem; onSelect: () => void }) {
  const Icon = item.icon;
  const toneClass =
    item.tone === "danger"
      ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
      : "text-[var(--text)] hover:bg-[var(--surface-muted)]";
  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] font-semibold transition ${toneClass}`;

  if (item.href) {
    return (
      <Link href={item.href} className={className} onClick={onSelect}>
        <Icon size={16} aria-hidden />
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        item.onSelect?.();
        onSelect();
      }}
      className={className}
    >
      <Icon size={16} aria-hidden />
      {item.label}
    </button>
  );
}
