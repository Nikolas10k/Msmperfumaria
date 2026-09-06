import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProductGender, FragranceType } from "@/lib/types/database";
import { computeEffectivePrice, type EffectivePrice } from "@/lib/pricing/effective-price";
import { getActiveCampaigns, getActivePromotionsMap, campaignsForProduct } from "@/lib/catalog/active-discounts";

export interface ProductVariantDetail {
  id: string;
  volumeMl: number;
  sku: string;
  installmentsMax: number;
  stock: number;
  isActive: boolean;
  price: EffectivePrice;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  gender: ProductGender;
  fragranceType: FragranceType;
  fragranceFamily: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  description: string;
  isOriginal: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  images: { url: string; altText: string | null }[];
  variants: ProductVariantDetail[];
  averageRating: number;
  reviewCount: number;
}

export async function getProductBySlug(
  supabase: SupabaseClient<Database>,
  brandSlug: string,
  productSlug: string,
): Promise<ProductDetail | null> {
  const { data: product } = await supabase
    .from("products")
    .select(
      `*, brands!inner(name, slug),
       product_images(url, alt_text, position, is_primary),
       product_variants(id, sku, volume_ml, price, compare_at_price, installments_max, is_active, inventory(quantity)),
       product_categories(category_id),
       reviews(rating, is_approved)`,
    )
    .eq("slug", productSlug)
    .eq("brands.slug", brandSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) return null;

  const brand = product.brands as unknown as { name: string; slug: string };
  const categoryIds = (product.product_categories as unknown as { category_id: string }[]).map(
    (c) => c.category_id,
  );
  const reviews = (product.reviews as unknown as { rating: number; is_approved: boolean }[]).filter(
    (r) => r.is_approved,
  );

  const [campaigns, promotionsMap] = await Promise.all([
    getActiveCampaigns(supabase),
    getActivePromotionsMap(supabase),
  ]);

  const applicableCampaigns = campaignsForProduct(campaigns, {
    id: product.id,
    brandId: product.brand_id,
    categoryIds,
  });

  const variants = (
    product.product_variants as unknown as {
      id: string;
      sku: string;
      volume_ml: number;
      price: number;
      compare_at_price: number | null;
      installments_max: number;
      is_active: boolean;
      inventory: { quantity: number } | null;
    }[]
  )
    .filter((v) => v.is_active)
    .sort((a, b) => a.volume_ml - b.volume_ml)
    .map((v) => {
      const promoPrice = promotionsMap.get(v.id);
      return {
        id: v.id,
        volumeMl: v.volume_ml,
        sku: v.sku,
        installmentsMax: v.installments_max,
        stock: v.inventory?.quantity ?? 0,
        isActive: v.is_active,
        price: computeEffectivePrice({
          basePrice: Number(v.price),
          compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : null,
          activePromotion: promoPrice !== undefined ? { promoPrice } : null,
          applicableCampaigns,
        }),
      };
    });

  const images = (
    product.product_images as unknown as {
      url: string;
      alt_text: string | null;
      position: number;
      is_primary: boolean;
    }[]
  )
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.position - b.position)
    .map((img) => ({ url: img.url, altText: img.alt_text }));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brandName: brand.name,
    brandSlug: brand.slug,
    gender: product.gender,
    fragranceType: product.fragrance_type,
    fragranceFamily: product.fragrance_family,
    topNotes: product.top_notes,
    heartNotes: product.heart_notes,
    baseNotes: product.base_notes,
    description: product.description,
    isOriginal: product.is_original,
    isBestseller: product.is_bestseller,
    isNewArrival: product.is_new_arrival,
    metaTitle: product.meta_title,
    metaDescription: product.meta_description,
    images,
    variants,
    averageRating:
      reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    reviewCount: reviews.length,
  };
}
