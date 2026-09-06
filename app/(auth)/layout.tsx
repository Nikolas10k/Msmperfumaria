import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <Link href="/" className="mb-10 flex flex-col items-center gap-3">
        <Image src="/logo.jpg" alt="MSM Perfumaria" width={64} height={64} className="rounded-full" />
        <span className="font-serif-display text-2xl tracking-wide text-gradient-rose">
          MSM PERFUMARIA
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
