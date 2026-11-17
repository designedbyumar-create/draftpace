import { LogoMark } from "@/design-system/Logo";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <div className="w-full max-w-[380px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-2.5"><LogoMark size={24} /><span className="text-body font-semibold">Draftpace Studio</span></div>
        <p className="mt-2 text-body-sm text-[var(--muted)]">Content for every channel, from the real products and guides.</p>
        <div className="mt-6"><LoginForm next={next ?? "/"} /></div>
      </div>
    </main>
  );
}
