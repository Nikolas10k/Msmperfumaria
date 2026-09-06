"use client";

import { useState } from "react";
import Image from "next/image";

export function Gallery({ images, alt }: { images: { url: string; altText: string | null }[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-surface">
        {current ? (
          <Image
            src={current.url}
            alt={current.altText ?? alt}
            fill
            priority
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">Sem imagem</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border ${
                index === active ? "border-rose" : "border-border"
              }`}
            >
              <Image src={image.url} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
