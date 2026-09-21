"use client";

import Link from "next/link";
import PauseProductControl from "@/components/product-shell/PauseProductControl";
import { FAMILY_HEALTH_BINDER_SLUG } from "../instanceData";
import { CARD, Heading, Section } from "./Care";
import { gate } from "./Gate";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

/**
 * Settings: what stays private and how, pausing the product, and replaying
 * the tour. There is nothing to configure that would change what is stored:
 * this product has no reminders and reads nothing on your behalf, so there
 * is no switch here pretending otherwise.
 */
export default function SettingsModule() {
  const data = useFamilyHealthBinder();
  const blocked = gate(data);
  if (blocked) return blocked;
  const { instanceId } = data;
  if (!instanceId) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Heading kicker="How this binder behaves" title="Settings" />

      <div className={`${CARD} flex flex-col gap-7 p-5`}>
        <Section title="What stays private">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-[14.5px] leading-relaxed text-[var(--text)]">
            <li>Each allergy, medication, symptom, vaccine and visit has a &ldquo;keep this private&rdquo; box. A private record stays in the app and is left off every printed page.</li>
            <li>Every printed page says how many records it left off, so a page never looks complete when it is not.</li>
            <li>Your binder is tied to your sign-in and is not shared with anyone. Nothing in it is read by an AI model, and there is no reminder or message sent about anyone.</li>
            <li>Removing a record takes it out of view. It is not shown or printed again.</li>
          </ul>
        </Section>

        <Section title="Pause this binder">
          <p className="mb-3 text-[14px] leading-relaxed text-[var(--muted)]">Pausing keeps everything exactly as it is and only stops this binder from asking for your attention on Home.</p>
          <PauseProductControl instanceId={instanceId} />
        </Section>

        <Section title="The tour">
          <Link href={`/app/products/${FAMILY_HEALTH_BINDER_SLUG}/workspace?tour=1`} className="text-[14.5px] font-semibold text-[var(--primary)] hover:underline">
            Show me around again
          </Link>
        </Section>
      </div>
    </div>
  );
}
