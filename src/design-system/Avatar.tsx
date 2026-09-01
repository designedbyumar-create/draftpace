/**
 * A circular initials avatar, the one place a signed-in user's identity
 * renders as a compact control, reused by AccountMenu across the
 * authenticated app and both public-header states. No image upload exists
 * yet, so this is initials-only, never a placeholder photo.
 */
function initialsFrom(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "?";
  const atIndex = trimmed.indexOf("@");
  const namePart = atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
  const words = namePart.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return trimmed[0]?.toUpperCase() ?? "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const SIZE_CLASS = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[13px]",
} as const;

export default function Avatar({
  label,
  size = "md",
  className = "",
}: {
  /** Display name or email, used only to derive initials, never rendered directly. */
  label: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-bold text-[var(--primary)] ${SIZE_CLASS[size]} ${className}`}
    >
      {initialsFrom(label)}
    </span>
  );
}
