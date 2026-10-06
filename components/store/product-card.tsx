import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog/list-products";

// Cartão de produto no formato do site: imagem em arco (topo redondo), nome
// em serif e preço em rótulo, com a mesma mola de hover dos cartões da home.
export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link href={`/perfumes/${product.brandSlug}/${product.slug}`} className="group block">
      <div className="product-frame arch-frame product-frame-card relative aspect-[3/4] bg-surface-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.brandName} ${product.name}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="lbl flex h-full items-center justify-center text-text-muted">Sem imagem</div>
        )}

        <div className="absolute left-3 top-4 z-10 flex flex-col items-start gap-1.5">
          {product.isBestseller && <Badge>Mais vendido</Badge>}
          {product.isNewArrival && <Badge variant="dark">Lançamento</Badge>}
          {product.hasDiscount && <Badge variant="danger">-{product.discountPercent}%</Badge>}
        </div>

        {!product.inStock && (
          <div className="lbl absolute inset-x-0 bottom-0 z-10 bg-ink/80 py-2 text-center text-text-muted">
            Esgotado
          </div>
        )}
      </div>

      <div className="px-1 pt-4">
        <p className="lbl text-text-muted">{product.brandName}</p>
        <p className="font-serif-display mt-1.5 truncate text-[22px] leading-none">{product.name}</p>
        <div className="mt-2 flex items-baseline gap-2">
          {product.hasDiscount && (
            <span className="text-xs text-text-muted line-through">{formatBRL(product.minOriginalPrice)}</span>
          )}
          <span className="text-sm text-rose-light">{formatBRL(product.minPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
