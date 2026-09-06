"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label, Select } from "@/components/ui/input";

export function CatalogFiltersBar({ brands }: { brands: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-6">
      <div>
        <Label htmlFor="genero">Gênero</Label>
        <Select id="genero" value={searchParams.get("genero") ?? ""} onChange={(e) => setParam("genero", e.target.value)}>
          <option value="">Todos</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="unissex">Unissex</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="marca">Marca</Label>
        <Select id="marca" value={searchParams.get("marca") ?? ""} onChange={(e) => setParam("marca", e.target.value)}>
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="ordenar">Ordenar por</Label>
        <Select id="ordenar" value={searchParams.get("ordenar") ?? "mais-vendidos"} onChange={(e) => setParam("ordenar", e.target.value)}>
          <option value="mais-vendidos">Mais vendidos</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-preco">Maior preço</option>
          <option value="recentes">Mais recentes</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="precoMin">Preço mín.</Label>
          <input
            id="precoMin"
            type="number"
            defaultValue={searchParams.get("precoMin") ?? ""}
            onBlur={(e) => setParam("precoMin", e.target.value)}
            className="h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm text-text-primary"
          />
        </div>
        <div>
          <Label htmlFor="precoMax">Preço máx.</Label>
          <input
            id="precoMax"
            type="number"
            defaultValue={searchParams.get("precoMax") ?? ""}
            onBlur={(e) => setParam("precoMax", e.target.value)}
            className="h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm text-text-primary"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={searchParams.get("ofertas") === "1"}
          onChange={(e) => setParam("ofertas", e.target.checked ? "1" : "")}
        />
        Somente ofertas
      </label>
    </aside>
  );
}
