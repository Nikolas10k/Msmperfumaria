"use server";

import { createClient } from "@/lib/supabase/server";
import { getCartDetails, type CartDetailLine } from "@/lib/cart/queries";
import type { CartLine } from "@/lib/cart/cart-context";

export async function getCartDetailsAction(lines: CartLine[]): Promise<CartDetailLine[]> {
  const supabase = await createClient();
  return getCartDetails(supabase, lines);
}
