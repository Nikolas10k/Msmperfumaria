export type MatchableProduct = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
};

// Remove tudo que não for letra/número — usado como comparação de reserva
// pra casos como "jadore" (arquivo) vs "j-adore" (slug de "J'adore"), onde o
// separador do slug não tem correspondência direta no nome do arquivo.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(0, idx) : filename;
}

export function matchProductByFilename(
  filename: string,
  products: MatchableProduct[],
): MatchableProduct | null {
  const base = stripExtension(filename).trim().toLowerCase();
  const bySlug = products.find((p) => p.slug === base);
  if (bySlug) return bySlug;

  const normalizedBase = normalize(base);
  const byNormalizedSlug = products.find((p) => normalize(p.slug) === normalizedBase);
  if (byNormalizedSlug) return byNormalizedSlug;

  const byNormalizedName = products.find((p) => normalize(p.name) === normalizedBase);
  if (byNormalizedName) return byNormalizedName;

  return null;
}
