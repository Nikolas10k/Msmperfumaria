import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
  {
    variants: {
      variant: {
        primary: "bg-rose text-ink hover:bg-rose-light",
        secondary: "bg-transparent border border-rose-hairline text-text-primary hover:border-rose hover:text-rose",
        ghost: "bg-transparent text-text-primary hover:text-rose",
        danger: "bg-danger text-white hover:opacity-90",
        dark: "bg-ink text-paper hover:bg-black",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base uppercase",
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
