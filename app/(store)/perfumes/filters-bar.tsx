"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label, Select } from "@/components/ui/input";

const GENDERS = [
  { value: "", label: "Todos" },
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "unissex", label: "Unissex" },
];

export function CatalogFiltersBar({ brands }: { brands: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gender = searchParams.get("genero") ?? "";
  const onlyOffers = searchParams.get("ofertas") === "1";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-7">
      <div>
        <Label>Gênero</Label>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setParam("genero", g.value)}
              className={`chip-spring rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide ${
                gender === g.value
                  ? "border-rose bg-rose text-ink"
                  : "border-border text-text-secondary hover:border-rose-hairline hover:text-rose"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
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

      <div>
        <Label>Faixa de preço</Label>
        <div className="grid grid-cols-2 gap-2">
          <input
            id="precoMin"
            type="number"
            placeholder="Mín."
            defaultValue={searchParams.get("precoMin") ?? ""}
            onBlur={(e) => setParam("precoMin", e.target.value)}
            className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-rose focus:outline-none"
          />
          <input
            id="precoMax"
            type="number"
            placeholder="Máx."
            defaultValue={searchParams.get("precoMax") ?? ""}
            onBlur={(e) => setParam("precoMax", e.target.value)}
            className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-rose focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setParam("ofertas", onlyOffers ? "" : "1")}
        className={`chip-spring flex w-full items-center justify-between rounded-full border px-4 py-2.5 text-sm ${
          onlyOffers
            ? "border-rose bg-rose/10 text-rose-light"
            : "border-border text-text-secondary hover:border-rose-hairline"
        }`}
      >
        Somente ofertas
        <span
          className={`flex h-5 w-9 items-center rounded-full border px-0.5 transition-colors ${
            onlyOffers ? "border-rose bg-rose justify-end" : "border-border bg-surface-2 justify-start"
          }`}
        >
          <span className="h-3.5 w-3.5 rounded-full bg-text-primary" />
        </span>
      </button>
    </aside>
  );
}
