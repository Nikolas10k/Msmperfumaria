"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

export function CartLink() {
  const { totalCount } = useCart();

  return (
    <Link href="/carrinho" aria-label="Carrinho" className="relative hover:text-rose">
      <ShoppingBag size={20} />
      {totalCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[10px] font-medium text-ink">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
