"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, keyHash, sameString } from "~/lib/access";

export async function signIn(_: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const key = String(form.get("key") ?? "");
  const expected = process.env.STUDIO_ACCESS_KEY;
  if (!expected) redirect("/");
  if (!sameString(await keyHash(key), await keyHash(expected))) return { error: "That key is not right." };
  (await cookies()).set(ACCESS_COOKIE, await keyHash(expected), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  const next = String(form.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
