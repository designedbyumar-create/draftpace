import { LogoMark } from "@/design-system/Logo";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-12 text-[var(--text)]">
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center text-center">
        <LogoMark size={64} />
        <h1 className="mt-6 text-2xl font-black tracking-tight">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Recently opened content still works. New content and account changes need a connection.
        </p>
      </div>
    </main>
  );
}
