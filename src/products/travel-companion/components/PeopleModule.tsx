"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Globe, Plus, User } from "@/design-system/Icon";
import { useTravelCompanion } from "./useTravelCompanion";
import TripSetupForm from "./TripSetupForm";
import PersonForm from "./PersonForm";

/**
 * People.
 *
 * Who is travelling, and what belongs to each of them, rather than one
 * trip-level list everything gets dumped into. A child never gets an
 * account here; that is a schema fact (trv_people has no user_id
 * column at all), not only a UI rule.
 */
export default function PeopleModule() {
  const { status, errorMessage, instanceId, trips, currentTrip, people, addTrip, addPerson } = useTravelCompanion();
  const [settingUp, setSettingUp] = useState(false);
  const [adding, setAdding] = useState(false);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState icon={User} title="Nothing to show yet" description="This product has not been set up on your account." />
    );
  }
  if (status === "error") {
    return <EmptyState icon={User} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  if (!currentTrip) {
    if (settingUp) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <TripSetupForm instanceId={instanceId} onCreated={addTrip} onCancel={() => setSettingUp(false)} />
        </div>
      );
    }
    return (
      <EmptyState
        icon={Globe}
        title={trips.length === 0 ? "No trip yet" : "Nothing currently in progress"}
        description="Set up a trip before adding the people travelling on it."
        action={
          <button type="button" onClick={() => setSettingUp(true)} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
            Set up a trip
          </button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            {currentTrip.title.toUpperCase()}
          </p>
          <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            People
          </h1>
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)} iconLeft={<Plus size={14} aria-hidden />}>
            Add traveller
          </Button>
        )}
      </header>

      {adding && (
        <PersonForm
          instanceId={instanceId}
          tripId={currentTrip.id}
          onAdded={(person) => {
            addPerson(person);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {people.length === 0 && !adding && (
        <EmptyState icon={User} title="Nobody added yet" description="Add everyone travelling, one at a time." />
      )}

      <ul className="flex flex-col gap-2">
        {people.map((person) => (
          <li key={person.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-medium text-[var(--text)]">{person.name}</p>
              {person.isChild && (
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Child
                </span>
              )}
            </div>
            {person.relationshipNote && <p className="mt-1 text-[13px] text-[var(--muted)]">{person.relationshipNote}</p>}
            {person.requirements && <p className="mt-1 text-[13px] text-[var(--muted)]">{person.requirements}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
