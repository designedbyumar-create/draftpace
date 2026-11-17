"use client";

import { useTransition } from "react";
import { setPostStatus, unschedule } from "../actions";

/** Mark a post as posted (or not), or take it off the calendar. */
export default function PostActions({ id, status }: { id: string; status: "scheduled" | "posted" }) {
  const [pending, start] = useTransition();
  return (
    <span className="mt-1 hidden gap-2 group-hover:flex group-focus-within:flex">
      <button disabled={pending} onClick={() => start(() => setPostStatus(id, status === "posted" ? "scheduled" : "posted"))} className="font-semibold text-[var(--primary)]">{status === "posted" ? "Undo posted" : "Mark posted"}</button>
      <button disabled={pending} onClick={() => start(() => unschedule(id))} className="font-semibold text-[var(--muted)] hover:text-[var(--danger)]">Remove</button>
    </span>
  );
}
