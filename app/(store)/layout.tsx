import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </CartProvider>
  );
}
