"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { uploadProductImagesAction, setPrimaryImageAction, deleteImageAction } from "./image-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImageRow {
  id: string;
  url: string;
  is_primary: boolean;
}

export function ImageManager({ productId, images }: { productId: string; images: ImageRow[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-sm border border-border">
            <div className="relative aspect-square bg-surface-2">
              <Image src={image.url} alt="" fill className="object-cover" unoptimized />
            </div>
            {image.is_primary && (
              <Badge className="absolute left-2 top-2">Principal</Badge>
            )}
            <div className="flex items-center justify-between bg-surface p-2 text-xs">
              {!image.is_primary && (
                <button
                  type="button"
                  className="text-text-secondary hover:text-rose"
                  disabled={pending}
                  onClick={() => startTransition(() => setPrimaryImageAction(image.id, productId))}
                >
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                className="text-danger hover:opacity-80"
                disabled={pending}
                onClick={() => startTransition(() => deleteImageAction(image.id))}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={(formData) => startTransition(() => uploadProductImagesAction(formData))}
        className="flex items-center gap-3"
      >
        <input type="hidden" name="product_id" value={productId} />
        <input
          type="file"
          name="files"
          accept="image/*"
          multiple
          className="text-sm text-text-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-rose file:px-3 file:py-2 file:text-ink"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enviando…" : "Enviar imagens"}
        </Button>
      </form>
    </div>
  );
}
