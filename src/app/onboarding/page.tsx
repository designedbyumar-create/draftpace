"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "@/design-system/theme/ThemeProvider";
import StepShell from "@/components/onboarding/StepShell";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import NeedStep from "@/components/onboarding/NeedStep";
import ReminderStep from "@/components/onboarding/ReminderStep";

const TOTAL_STEPS = 3;

/**
 * Three moments, one continuous card (see StepShell) — not a numbered
 * wizard. This page only owns state and the finish/skip routing decision;
 * each moment's actual content and motion lives in its own component under
 * src/components/onboarding/. See docs in the redesign plan for why: a
 * theme change is live, "what brings you here" routes straight to a real
 * product when one matches (src/content/needs.ts + ShopProduct.needGroups),
 * and nothing here is written to user_metadata unless it's actually read
 * somewhere (reminder_time is; the old focus_categories/primary_goal/theme
 * writes were dead data and are gone).
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("there");
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<{ title: string; href: string } | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/signup");
        return;
      }
      setName(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there");
    });

    if (!("Notification" in window)) setNotifications("unsupported");
    else setNotifications(Notification.permission);
  }, [router]);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setNotifications("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifications(permission);
  };

  const finish = async () => {
    const metadata: Record<string, unknown> = { onboarding_complete: true };
    if (reminderTime) metadata.reminder_time = reminderTime;
    await supabase.auth.updateUser({ data: metadata });
    router.replace(matchedProduct?.href ?? "/app");
  };

  const canContinue = step !== 0 || Boolean(theme);

  return (
    <StepShell
      step={step}
      totalSteps={TOTAL_STEPS}
      onSkip={finish}
      onBack={() => setStep((current) => Math.max(0, current - 1))}
      onContinue={() => (step === TOTAL_STEPS - 1 ? finish() : setStep((current) => current + 1))}
      canGoBack={step > 0}
      canContinue={canContinue}
      continueLabel={step === TOTAL_STEPS - 1 ? "Enter Draftpace" : "Continue"}
    >
      {step === 0 && <WelcomeStep name={name} theme={theme} onSelectTheme={setTheme} />}
      {step === 1 && <NeedStep selectedNeed={selectedNeed} onSelect={setSelectedNeed} onMatchChange={setMatchedProduct} />}
      {step === 2 && (
        <ReminderStep
          reminderTime={reminderTime}
          onSelectTime={setReminderTime}
          notifications={notifications}
          onRequestNotifications={requestNotifications}
        />
      )}
    </StepShell>
  );
}
