import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Cartão com contorno fino e cantos de 10px, como os cartões do site.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-surface p-6 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-text-primary)_6%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
