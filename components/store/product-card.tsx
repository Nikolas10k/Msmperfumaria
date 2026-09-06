import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog/list-products";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/perfumes/${product.brandSlug}/${product.slug}`}
      className="group block overflow-hidden rounded-md border border-border bg-surface transition-colors hover:border-gold-hairline"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.brandName} ${product.name}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">Sem imagem</div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isBestseller && <Badge>Mais vendido</Badge>}
          {product.isNewArrival && <Badge variant="dark">Lançamento</Badge>}
          {product.hasDiscount && <Badge variant="danger">-{product.discountPercent}%</Badge>}
        </div>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-[11px] uppercase tracking-wide text-text-muted">
            Esgotado
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-text-muted">{product.brandName}</p>
        <p className="mt-1 truncate text-sm text-text-primary">{product.name}</p>
        <div className="mt-2 flex items-baseline gap-2">
          {product.hasDiscount && (
            <span className="text-xs text-text-muted line-through">{formatBRL(product.minOriginalPrice)}</span>
          )}
          <span className="text-base text-gold-light">{formatBRL(product.minPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
