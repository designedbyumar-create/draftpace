/**
 * What decides a signed-in user's Blobatar (see design-system/Avatar.tsx).
 * Every account gets a real, distinct avatar from the moment it exists —
 * the user id is always there and never collides — and changing it later
 * (Account page's "Shuffle" control) only ever means writing a new
 * `avatar_seed` into user_metadata, never choosing or uploading an image.
 */

export function resolveAvatarSeed(user: { id: string; user_metadata?: Record<string, unknown> | null }): string {
  const custom = user.user_metadata?.avatar_seed;
  return typeof custom === "string" && custom.length > 0 ? custom : user.id;
}

/**
 * A fresh random seed for "Shuffle" — not the user id, which would just
 * regenerate the same default avatar every time. Not cryptographic:
 * nothing here is a secret, it only has to not collide with the id shape
 * closely enough to be visibly a new identity.
 */
export function randomAvatarSeed(): string {
  return `shuffle-${Math.random().toString(36).slice(2, 10)}`;
}
