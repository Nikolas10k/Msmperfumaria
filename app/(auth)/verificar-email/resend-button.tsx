"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "../actions";
import { Button } from "@/components/ui/button";

export function ResendButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await resendVerificationAction();
            setMessage(result.message ?? null);
          })
        }
      >
        {pending ? "Reenviando…" : "Reenviar e-mail"}
      </Button>
      {message && <p className="mt-3 text-xs text-text-muted">{message}</p>}
    </div>
  );
}
