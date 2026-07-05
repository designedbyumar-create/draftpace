"use client";

import { motion } from "framer-motion";
import { CompanionResponse, SystemBlueprint } from "@/lib/systems";

const intentLabels: Record<CompanionResponse["intent"], string> = {
  started: "System guide",
  "path-selected": "Path set",
  "rhythm-set": "Rhythm set",
  "session-framed": "Session frame",
  completed: "Progress marked",
  "exceeded-target": "Sustainability check",
  adjusted: "Adjusted",
  recovery: "Recovery mode",
};

export default function CompanionPanel({
  blueprint,
  response,
  quiet = false,
}: {
  blueprint: SystemBlueprint;
  response: CompanionResponse;
  quiet?: boolean;
}) {
  return (
    <motion.section
      className={`rounded-[26px] border border-[var(--border)] ${
        quiet ? "bg-[var(--surface)]" : "bg-[var(--surface)]"
      } p-4 shadow-[0_12px_38px_rgba(15,23,42,0.05)]`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex flex-col items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: blueprint.visualTheme.accent }} />
          <span className="h-10 w-px bg-[var(--border)]" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Companion</p>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              {intentLabels[response.intent]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{response.line}</p>
        </div>
      </div>
    </motion.section>
  );
}
