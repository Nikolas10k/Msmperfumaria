import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Selos em caixa-alta pequena, como os rótulos do site (ex.: "Urgente").
const badgeVariants = cva("lbl inline-flex items-center rounded-[4px] px-2 py-[3px]", {
  variants: {
    variant: {
      rose: "bg-rose text-white",
      dark: "bg-ink/70 text-text-secondary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-text-primary)_18%,transparent)]",
      success: "bg-success/20 text-success",
      danger: "bg-danger text-white",
    },
  },
  defaultVariants: { variant: "rose" },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
