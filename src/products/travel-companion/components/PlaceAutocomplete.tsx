"use client";

import { useId, useMemo, useState } from "react";
import Input from "@/design-system/Input";

/**
 * A text field that searches a fixed list as you type.
 *
 * Matches anywhere in the name, case-insensitively ("arge" finds
 * "Argentina"), ranked so a match at the start of the name sorts first.
 * The typed value is always what gets saved, whether or not it matches
 * an option: this narrows down a known list, it never blocks or
 * corrects what somebody types. No suggestion of where to go, only of
 * how to spell where they said they're going.
 */
export default function PlaceAutocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const listId = useId();

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return options
      .filter((option) => option.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(query) ? 0 : 1;
        return aStarts !== bStarts ? aStarts - bStarts : a.localeCompare(b);
      })
      .slice(0, 8);
  }, [options, value]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        label={label}
        value={value}
        placeholder={placeholder}
        hint={hint}
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((current) => (current + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((current) => (current - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(matches[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg"
        >
          {matches.map((option, index) => (
            <li key={option} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(option)}
                className={`block w-full px-3.5 py-2 text-left text-body-sm ${
                  index === highlighted ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--text)]"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
