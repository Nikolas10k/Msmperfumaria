import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <Link href="/" className="mb-10 font-serif-display text-2xl tracking-wide text-gradient-rose">
        MSM PERFUMARIA
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
