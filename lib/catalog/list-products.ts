import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProductGender } from "@/lib/types/database";
import { computeEffectivePrice } from "@/lib/pricing/effective-price";
import { getActiveCampaigns, getActivePromotionsMap, campaignsForProduct } from "@/lib/catalog/active-discounts";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  gender: ProductGender;
  fragranceFamily: string;
  brandName: string;
  brandSlug: string;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOriginal: boolean;
  imageUrl: string | null;
  minPrice: number;
  minOriginalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  inStock: boolean;
  createdAt: string;
  categorySlugs: string[];
}

export interface CatalogFilters {
  gender?: ProductGender;
  brandSlug?: string;
  fragranceFamily?: string;
  priceMin?: number;
  priceMax?: number;
  onlyNewArrivals?: boolean;
  onlyOnSale?: boolean;
  categorySlug?: string;
  search?: string;
  sort?: "mais-vendidos" | "menor-preco" | "maior-preco" | "recentes";
}

export async function getCatalogProducts(
  supabase: SupabaseClient<Database>,
  filters: CatalogFilters = {},
): Promise<CatalogProduct[]> {
  let query = supabase
    .from("products")
    .select(
      `id, name, slug, gender, fragrance_family, is_bestseller, is_new_arrival, is_original, created_at, brand_id,
       brands!inner(name, slug),
       product_images(url, is_primary),
       product_categories(category_id, categories(slug)),
       product_variants(id, price, compare_at_price, is_active, inventory(quantity))`,
    )
    .eq("is_active", true);

  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.brandSlug) query = query.eq("brands.slug", filters.brandSlug);
  if (filters.fragranceFamily) query = query.ilike("fragrance_family", `%${filters.fragranceFamily}%`);
  if (filters.onlyNewArrivals) query = query.eq("is_new_arrival", true);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data } = await query;
  const [campaigns, promotionsMap] = await Promise.all([
    getActiveCampaigns(supabase),
    getActivePromotionsMap(supabase),
  ]);

  let products: CatalogProduct[] = (data ?? [])
    .map((product) => {
      const brand = product.brands as unknown as { name: string; slug: string };
      const productCategories = product.product_categories as unknown as {
        category_id: string;
        categories: { slug: string } | null;
      }[];
      const categorySlugs = productCategories.map((c) => c.categories?.slug ?? "");
      const categoryIds = productCategories.map((c) => c.category_id);
      const variants = (product.product_variants as unknown as {
        id: string;
        price: number;
        compare_at_price: number | null;
        is_active: boolean;
        inventory: { quantity: number } | null;
      }[]).filter((v) => v.is_active);

      if (variants.length === 0) return null;

      const applicableCampaigns = campaignsForProduct(campaigns, {
        id: product.id,
        brandId: product.brand_id,
        categoryIds,
      });

      const pricedVariants = variants.map((v) => {
        const promoPrice = promotionsMap.get(v.id);
        return computeEffectivePrice({
          basePrice: Number(v.price),
          compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : null,
          activePromotion: promoPrice !== undefined ? { promoPrice } : null,
          applicableCampaigns,
        });
      });

      const cheapest = pricedVariants.reduce((min, p) => (p.finalPrice < min.finalPrice ? p : min));
      const inStock = variants.some((v) => (v.inventory?.quantity ?? 0) > 0);
      const images = product.product_images as unknown as { url: string; is_primary: boolean }[];
      const primaryImage = images?.find((i) => i.is_primary) ?? images?.[0];

      const item: CatalogProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        gender: product.gender,
        fragranceFamily: product.fragrance_family,
        brandName: brand.name,
        brandSlug: brand.slug,
        isBestseller: product.is_bestseller,
        isNewArrival: product.is_new_arrival,
        isOriginal: product.is_original,
        imageUrl: primaryImage?.url ?? null,
        minPrice: cheapest.finalPrice,
        minOriginalPrice: cheapest.originalPrice,
        hasDiscount: cheapest.hasDiscount,
        discountPercent: cheapest.discountPercent,
        inStock,
        createdAt: product.created_at,
        categorySlugs,
      };
      return item;
    })
    .filter((p): p is CatalogProduct => p !== null);

  if (filters.categorySlug) {
    products = products.filter((p) => p.categorySlugs.includes(filters.categorySlug!));
  }
  if (filters.priceMin !== undefined) products = products.filter((p) => p.minPrice >= filters.priceMin!);
  if (filters.priceMax !== undefined) products = products.filter((p) => p.minPrice <= filters.priceMax!);
  if (filters.onlyOnSale) products = products.filter((p) => p.hasDiscount);

  switch (filters.sort) {
    case "menor-preco":
      products.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case "maior-preco":
      products.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case "recentes":
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "mais-vendidos":
    default:
      products.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
      break;
  }

  return products;
}
