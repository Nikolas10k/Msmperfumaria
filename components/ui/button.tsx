import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

// Botões no padrão do site do condomínio: altura fixa, raio de 7px, rótulo
// pequeno em caixa-alta e mola no hover (btn-spring no globals.css).
export const buttonVariants = cva(
  "btn-spring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] font-sans font-medium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-light",
  {
    variants: {
      variant: {
        primary: "bg-rose text-white hover:bg-rose-light hover:text-ink",
        glass: "pill-glass text-text-primary hover:text-white",
        secondary:
          "bg-transparent text-text-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-text-primary)_22%,transparent)] hover:bg-white/5",
        ghost: "bg-transparent text-text-primary hover:text-rose-light",
        danger: "bg-danger text-white hover:opacity-90",
        dark: "bg-ink text-paper hover:bg-black",
      },
      size: {
        sm: "h-9 px-4 text-[10.5px] uppercase tracking-[0.08em]",
        md: "h-11 px-6 text-[11px] uppercase tracking-[0.08em]",
        lg: "h-[42px] px-[22px] text-[11px] uppercase tracking-[0.08em]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
