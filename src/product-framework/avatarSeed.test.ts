import { describe, expect, it } from "vitest";
import { resolveAvatarSeed } from "./avatarSeed";

describe("resolveAvatarSeed", () => {
  it("uses the custom avatar_seed once one has been chosen", () => {
    expect(resolveAvatarSeed({ id: "user-1", user_metadata: { avatar_seed: "shuffle-abc123" } })).toBe(
      "shuffle-abc123"
    );
  });

  it("falls back to the user id when no avatar_seed has been set", () => {
    expect(resolveAvatarSeed({ id: "user-1", user_metadata: {} })).toBe("user-1");
  });

  it("falls back to the user id when user_metadata is missing entirely", () => {
    expect(resolveAvatarSeed({ id: "user-1" })).toBe("user-1");
  });

  it("falls back to the user id when avatar_seed is an empty string, not a real choice", () => {
    expect(resolveAvatarSeed({ id: "user-1", user_metadata: { avatar_seed: "" } })).toBe("user-1");
  });

  it("falls back to the user id when avatar_seed is present but not a string", () => {
    expect(resolveAvatarSeed({ id: "user-1", user_metadata: { avatar_seed: 42 } })).toBe("user-1");
  });

  it("two different accounts with no custom seed get two different avatars", () => {
    const a = resolveAvatarSeed({ id: "user-1", user_metadata: {} });
    const b = resolveAvatarSeed({ id: "user-2", user_metadata: {} });
    expect(a).not.toBe(b);
  });
});
