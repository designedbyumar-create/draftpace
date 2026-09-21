"use client";

import FirstRun from "@/components/platform/FirstRun";
import FirstRunTour from "@/components/platform/FirstRunTour";
import type { TourStep } from "@/components/platform/GuidedTour";
import { Heart } from "@/design-system/Icon";
import { todayIso } from "../dates";
import { FAMILY_HEALTH_BINDER_SLUG } from "../instanceData";
import { Heading } from "./Care";
import { gate } from "./Gate";
import PersonOverview from "./PersonOverview";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Nobody in the binder yet",
    body: "Everything here is a fact you type in about somebody in your family. Nothing is filled in for you and nothing is inferred.",
  },
  {
    targetId: "rail-members",
    title: "Start with a card",
    body: "Each person has one card: allergies, medications, vaccines, their doctor and who to call. Adults and children are all rows under your own account.",
  },
  {
    targetId: "rail-visits",
    title: "Write the questions down",
    body: "Put what you want to ask before an appointment here, and what was said after it, so neither has to be remembered in a waiting room.",
  },
  {
    targetId: "rail-printables",
    title: "It prints as the page you need",
    body: "A forms sheet for school and camp, a sheet for a sitter, an emergency card, a visit page. Anything you mark private stays off every one.",
  },
];

/**
 * Overview: everyone in the binder as a card, and only the things worth a
 * second look under each. No due-list and no ranking: nothing here is ever
 * overdue, this is a record and not a schedule.
 */
export default function WorkspaceModule() {
  const data = useFamilyHealthBinder();
  const blocked = gate(data);
  if (blocked) return blocked;
  const { members, facts, events, providers, visits } = data;

  if (members.length === 0) {
    return (
      <FirstRun
        slug={FAMILY_HEALTH_BINDER_SLUG}
        icon={Heart}
        title="Nobody added yet"
        description="Add the first person, and their answers to every form live in one place."
        actionLabel="Add the first person"
        destination="members"
        steps={TOUR_STEPS}
      />
    );
  }

  const today = todayIso();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <FirstRunTour slug={FAMILY_HEALTH_BINDER_SLUG} steps={TOUR_STEPS} />
      <Heading kicker="Everyone at a glance" title="Overview" />
      <ul className="flex flex-col gap-6">
        {members.map((member, index) => (
          <PersonOverview key={member.id} member={member} index={index} facts={facts} events={events} providers={providers} visits={visits} today={today} />
        ))}
      </ul>
    </div>
  );
}
