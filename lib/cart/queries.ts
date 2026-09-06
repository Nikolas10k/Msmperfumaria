import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { computeEffectivePrice } from "@/lib/pricing/effective-price";
import { getActiveCampaigns, getActivePromotionsMap, campaignsForProduct } from "@/lib/catalog/active-discounts";
import type { CartLine } from "@/lib/cart/cart-context";

export interface CartDetailLine {
  variantId: string;
  quantity: number;
  productSlug: string;
  brandSlug: string;
  productName: string;
  brandName: string;
  volumeMl: number;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  originalPrice: number;
  availableStock: number;
  isActive: boolean;
}

/**
 * Fonte única de verdade para preços do carrinho/checkout — nunca confiar em
 * valores vindos do client. Recalcula promoções/campanhas ativas a cada chamada.
 */
export async function getCartDetails(
  supabase: SupabaseClient<Database>,
  lines: CartLine[],
): Promise<CartDetailLine[]> {
  if (lines.length === 0) return [];

  const variantIds = lines.map((l) => l.variantId);

  const [{ data: variants }, campaigns, promotionsMap] = await Promise.all([
    supabase
      .from("product_variants")
      .select(
        "id, sku, volume_ml, price, compare_at_price, is_active, inventory(quantity), products(id, name, slug, brand_id, brands(name, slug), product_categories(category_id), product_images(url, is_primary))",
      )
      .in("id", variantIds),
    getActiveCampaigns(supabase),
    getActivePromotionsMap(supabase),
  ]);

  const result: CartDetailLine[] = [];

  for (const line of lines) {
    const variant = variants?.find((v) => v.id === line.variantId);
    if (!variant) continue;

    const product = variant.products as unknown as {
      id: string;
      name: string;
      slug: string;
      brand_id: string;
      brands: { name: string; slug: string } | null;
      product_categories: { category_id: string }[];
      product_images: { url: string; is_primary: boolean }[];
    } | null;
    if (!product) continue;

    const categoryIds = product.product_categories?.map((c) => c.category_id) ?? [];
    const applicableCampaigns = campaignsForProduct(campaigns, {
      id: product.id,
      brandId: product.brand_id,
      categoryIds,
    });
    const promoPrice = promotionsMap.get(variant.id);

    const price = computeEffectivePrice({
      basePrice: Number(variant.price),
      compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : null,
      activePromotion: promoPrice !== undefined ? { promoPrice } : null,
      applicableCampaigns,
    });

    const primaryImage =
      product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];

    result.push({
      variantId: variant.id,
      quantity: line.quantity,
      sku: variant.sku,
      productSlug: product.slug,
      brandSlug: product.brands?.slug ?? "",
      productName: product.name,
      brandName: product.brands?.name ?? "",
      volumeMl: variant.volume_ml,
      imageUrl: primaryImage?.url ?? null,
      unitPrice: price.finalPrice,
      originalPrice: price.originalPrice,
      availableStock: (variant.inventory as unknown as { quantity: number } | null)?.quantity ?? 0,
      isActive: variant.is_active,
    });
  }

  return result;
}
