import PlaceholderModule from "../../personal-life-affairs-companion/components/PlaceholderModule";
import { Compass, Globe, User, Settings } from "@/design-system/Icon";

/**
 * Phase 1 scaffolding only, for whatever destinations are still not
 * real yet. Today, Trip, People and Record are real as of Phase 6;
 * Settings is the one destination still honestly not-built-yet.
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

export function SettingsPlaceholder() {
  return (
    <PlaceholderModule
      icon={Settings}
      title="Nothing to set yet"
      description="When there is something worth choosing here, it will appear. Nothing is switched on behind the scenes."
    />
  );
}
