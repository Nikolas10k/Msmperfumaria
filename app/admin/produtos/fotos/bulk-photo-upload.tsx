"use client";

import { useMemo, useState } from "react";
import { uploadProductImagesAction } from "../image-actions";
import { matchProductByFilename, type MatchableProduct } from "@/lib/admin/photo-match";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

type Entry = {
  file: File;
  previewUrl: string;
  productId: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMessage?: string;
};

export function BulkPhotoUpload({ products }: { products: MatchableProduct[] }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sending, setSending] = useState(false);

  const matchedCount = entries.filter((e) => e.productId).length;
  const doneCount = entries.filter((e) => e.status === "done").length;

  const productLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, `${p.brandName} — ${p.name}`);
    return map;
  }, [products]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newEntries: Entry[] = Array.from(fileList).map((file) => {
      const match = matchProductByFilename(file.name, products);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        productId: match?.id ?? "",
        status: "pending",
      };
    });
    setEntries(newEntries);
  }

  function updateEntry(index: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  async function handleSend() {
    setSending(true);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.productId || entry.status === "done") continue;

      updateEntry(i, { status: "uploading" });
      try {
        const fd = new FormData();
        fd.set("product_id", entry.productId);
        fd.append("files", entry.file);
        await uploadProductImagesAction(fd);
        updateEntry(i, { status: "done" });
      } catch (err) {
        updateEntry(i, { status: "error", errorMessage: err instanceof Error ? err.message : "Falha no envio." });
      }
    }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="text-sm text-text-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-rose file:px-3 file:py-2 file:text-ink"
        />
      </div>

      {entries.length > 0 && (
        <>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">{matchedCount} de {entries.length} combinados</Badge>
            {entries.length - matchedCount > 0 && (
              <Badge variant="danger">{entries.length - matchedCount} sem correspondência</Badge>
            )}
            {doneCount > 0 && <Badge variant="dark">{doneCount} enviados</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry, index) => (
              <div key={index} className="space-y-2 rounded-md border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview local via blob:, next/image não aceita esse esquema */}
                <img src={entry.previewUrl} alt="" className="aspect-square w-full rounded-sm object-cover" />
                <p className="truncate text-xs text-text-muted" title={entry.file.name}>
                  {entry.file.name}
                </p>
                <Select
                  value={entry.productId}
                  onChange={(e) => updateEntry(index, { productId: e.target.value })}
                  disabled={entry.status === "uploading" || entry.status === "done"}
                  className="text-xs"
                >
                  <option value="">— sem correspondência —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {productLabel.get(p.id)}
                    </option>
                  ))}
                </Select>
                {entry.status === "uploading" && <Badge variant="dark">Enviando…</Badge>}
                {entry.status === "done" && <Badge variant="success">Enviado</Badge>}
                {entry.status === "error" && (
                  <Badge variant="danger" title={entry.errorMessage}>
                    Erro
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSend} disabled={sending || matchedCount === 0}>
            {sending ? `Enviando ${doneCount}/${matchedCount}…` : `Enviar ${matchedCount} foto(s)`}
          </Button>
        </>
      )}
    </div>
  );
}
