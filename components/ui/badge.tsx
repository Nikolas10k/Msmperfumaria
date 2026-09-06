import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        rose: "bg-rose/15 text-rose-light border border-rose-hairline",
        dark: "bg-surface-2 text-text-secondary border border-border",
        success: "bg-success/15 text-success border border-success/30",
        danger: "bg-danger/15 text-danger border border-danger/30",
      },
    },
    defaultVariants: { variant: "rose" },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
