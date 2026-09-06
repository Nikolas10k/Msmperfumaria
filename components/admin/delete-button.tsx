"use client";

import { useTransition } from "react";

export function DeleteButton({
  id,
  action,
  label = "Excluir",
  confirmMessage = "Tem certeza que deseja excluir este item?",
  tone = "danger",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
  confirmMessage?: string;
  tone?: "danger" | "neutral";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action(id));
        }
      }}
      className={
        tone === "danger"
          ? "text-danger hover:opacity-80 disabled:opacity-50"
          : "text-text-secondary hover:text-rose disabled:opacity-50"
      }
    >
      {pending ? "Aguarde…" : label}
    </button>
  );
}
