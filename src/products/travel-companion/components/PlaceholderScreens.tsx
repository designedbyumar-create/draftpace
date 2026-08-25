import PlaceholderModule from "../../personal-life-affairs-companion/components/PlaceholderModule";
import { Compass, Globe, User, Clock, Settings } from "@/design-system/Icon";

/**
 * Phase 1 scaffolding only. Every destination this product declares is
 * reachable so the shell, theme and navigation can be verified live,
 * same "empty module stubs wired to every destination" step every prior
 * product's own Phase 1 or Phase 0 used, but nothing here is a real
 * feature. Today, Trip and People become real in Phase 2; Record and
 * the Companion follow in later phases per the approved proposal.
 */

export function TodayPlaceholder() {
  return (
    <PlaceholderModule
      icon={Compass}
      title="Nothing to show yet"
      description="Once a trip exists, today's operational state appears here, derived from what you've recorded."
    />
  );
}

export function TripPlaceholder() {
  return (
    <PlaceholderModule
      icon={Globe}
      title="No trip yet"
      description="Set up a trip to start connecting the people, places and bookings it depends on."
    />
  );
}

export function PeoplePlaceholder() {
  return (
    <PlaceholderModule
      icon={User}
      title="Nobody added yet"
      description="Travellers appear here once a trip exists, each with their own documents and bookings."
    />
  );
}

export function RecordPlaceholder() {
  return (
    <PlaceholderModule
      icon={Clock}
      title="Nothing recorded yet"
      description="What happened on the trip, and what's worth knowing next time, appears here as it happens."
    />
  );
}

export function SettingsPlaceholder() {
  return (
    <PlaceholderModule
      icon={Settings}
      title="Nothing to set yet"
      description="When there is something worth choosing here, it will appear. Nothing is switched on behind the scenes."
    />
  );
}
