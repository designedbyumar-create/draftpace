"use client";

import { useActionState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";
import { signIn } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Input label="Studio access key" name="key" type="password" autoComplete="current-password" required autoFocus />
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" variant="commit" fullWidth disabled={pending}>{pending ? "Checking" : "Open Studio"}</Button>
    </form>
  );
}
