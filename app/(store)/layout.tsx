import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { IntroLoader } from "@/components/store/intro-loader";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <IntroLoader>
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
      </IntroLoader>
    </CartProvider>
  );
}
