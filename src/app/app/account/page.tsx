"use client";

import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import { supabase } from "@/lib/supabase/client";
import Surface from "@/design-system/Surface";
import SettingsRow from "@/components/platform/SettingsRow";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import Avatar from "@/design-system/Avatar";
import { resolveAvatarSeed, randomAvatarSeed } from "@/product-framework/avatarSeed";

export default function AccountPage() {
  const user = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const provider = user.app_metadata?.provider === "google" ? "Google" : "Email and password";
  const accountLabel = user.user_metadata?.display_name || user.email || "Account";

  // useSession()'s user is a static snapshot from the server render (see
  // its own comment), so a shuffle has to be reflected here directly
  // rather than by re-reading user.user_metadata after the write — the
  // same reason Settings page's reminder_time keeps its own local state
  // instead of trusting the session to refresh.
  const [avatarSeed, setAvatarSeed] = useState(() => resolveAvatarSeed(user));
  const [shuffling, setShuffling] = useState(false);

  const handleShuffle = async () => {
    const nextSeed = randomAvatarSeed();
    setShuffling(true);
    const { error } = await supabase.auth.updateUser({ data: { avatar_seed: nextSeed } });
    setShuffling(false);
    if (!error) setAvatarSeed(nextSeed);
  };

  // toLocaleString() depends on the runtime's locale and time zone, which
  // differ between the server render and the browser, so it can only be
  // computed after mount to avoid a hydration mismatch.
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  useEffect(() => {
    setLastSignIn(user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Unknown");
  }, [user.last_sign_in_at]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <PlatformShell title="Account" subtitle="Your identity, sessions, and data controls">
      <div className="space-y-8">
        <section>
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">Identity</h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Avatar" description="Generated from your account, not uploaded — shuffle for a different one.">
                <div className="flex items-center gap-3">
                  <Avatar label={accountLabel} seed={avatarSeed} size="md" />
                  <Button variant="secondary" size="sm" onClick={handleShuffle} disabled={shuffling}>
                    {shuffling ? "Shuffling…" : "Shuffle"}
                  </Button>
                </div>
              </SettingsRow>
              <SettingsRow label="Email" description={user.email || "—"} />
              <SettingsRow label="Name" description={String(user.user_metadata?.display_name || "Not set")} />
              <SettingsRow label="Sign-in method" description={provider} />
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">
            Sessions and devices
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="This device" description={lastSignIn ? `Last signed in ${lastSignIn}` : "Last signed in —"}>
                <Badge tone="success">Active</Badge>
              </SettingsRow>
              <SettingsRow label="Manage other devices" description="View and sign out other sessions." unavailable />
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">Security</h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Password" description="Change your password.">
                <Button href="/forgot-password" variant="secondary" size="sm">
                  Reset password
                </Button>
              </SettingsRow>
              <SettingsRow label="Two-factor authentication" unavailable />
              <SettingsRow label="Sign out">
                <Button variant="secondary" size="sm" onClick={handleSignOut} disabled={signingOut}>
                  {signingOut ? "Signing out…" : "Sign out"}
                </Button>
              </SettingsRow>
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-eyebrow font-bold uppercase text-[var(--faint)]">
            Privacy and data
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Export your data" description="Download an understandable copy of your account and product data." unavailable />
              <SettingsRow label="Delete a product instance" description="Remove one product without deleting your account." unavailable />
              <SettingsRow label="Delete account" description="Permanently delete your account and data." unavailable />
            </div>
          </Surface>
          <div className="mt-3">
            <Alert tone="info">
              Data export and account deletion aren&apos;t built yet. Contact support if you need either before
              they ship.
            </Alert>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
