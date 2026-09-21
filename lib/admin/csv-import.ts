import "server-only";
import { slugify } from "@/lib/utils";
import type { FragranceType, ProductGender } from "@/lib/types/database";

export type ParsedImportRow = {
  line: number;
  name: string;
  brandName: string;
  gender: ProductGender | null;
  fragranceType: FragranceType | null;
  volumeMl: number | null;
  categoryName: string | null;
  fragranceFamily: string;
  price: number;
  stock: number;
  description: string;
  errors: string[];
};

// Aceita ; ou , como separador — detecta pelo cabeçalho, já que CSVs
// exportados de planilhas em pt-BR normalmente usam ;.
function detectDelimiter(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

// Parser simples com suporte a campos entre aspas (permite o delimitador e
// quebras de linha dentro do valor, como o CSV do Excel/Sheets gera).
function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const HEADER_ALIASES: Record<string, string> = {
  produto: "name",
  nome: "name",
  marca: "brand",
  genero: "gender",
  concentracao: "fragranceType",
  volume: "volume",
  categoria: "category",
  "familia olfativa": "fragranceFamily",
  preco: "price",
  estoque: "stock",
  descricao: "description",
  imagem: "image",
};

const GENDER_MAP: Record<string, ProductGender> = {
  masculino: "masculino",
  feminino: "feminino",
  unissex: "unissex",
};

const FRAGRANCE_TYPE_MAP: Record<string, FragranceType> = {
  "eau de toilette": "eau_de_toilette",
  "eau de parfum": "eau_de_parfum",
  "eau de cologne": "eau_de_cologne",
  parfum: "parfum",
  perfume: "parfum",
  "eau fraiche": "eau_fraiche",
};

function parseVolume(value: string): number | null {
  const match = value.replace(",", ".").match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  return Math.round(parseFloat(match[1]));
}

// Aceita "199,90", "R$ 199,90", "1.199,90" (formato brasileiro) ou "199.90".
function parseBRLNumber(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseCatalogCsv(text: string): ParsedImportRow[] {
  const delimiter = detectDelimiter(text.split(/\r?\n/, 1)[0] ?? "");
  const table = parseCsvRows(text.trim(), delimiter);
  if (table.length < 2) return [];

  const headerCells = table[0].map(normalizeHeader);
  const columnIndex: Partial<Record<string, number>> = {};
  headerCells.forEach((cell, index) => {
    const key = HEADER_ALIASES[cell];
    if (key) columnIndex[key] = index;
  });

  const cellOf = (row: string[], key: string): string => {
    const index = columnIndex[key];
    return index === undefined ? "" : (row[index] ?? "").trim();
  };

  return table.slice(1).map((row, rowIndex) => {
    const errors: string[] = [];

    const name = cellOf(row, "name");
    if (!name) errors.push("Nome do produto vazio.");

    const brandName = cellOf(row, "brand");
    if (!brandName) errors.push("Marca vazia.");

    const genderRaw = normalizeHeader(cellOf(row, "gender"));
    const gender = GENDER_MAP[genderRaw] ?? null;
    if (!gender) errors.push(`Gênero "${cellOf(row, "gender")}" não reconhecido.`);

    const fragranceTypeRaw = normalizeHeader(cellOf(row, "fragranceType"));
    const fragranceType = FRAGRANCE_TYPE_MAP[fragranceTypeRaw] ?? null;
    if (!fragranceType) {
      errors.push(`Concentração "${cellOf(row, "fragranceType")}" não reconhecida.`);
    }

    const volumeRaw = cellOf(row, "volume");
    const volumeMl = volumeRaw ? parseVolume(volumeRaw) : null;
    if (!volumeMl) errors.push(`Volume "${volumeRaw}" inválido.`);

    const fragranceFamily = cellOf(row, "fragranceFamily");
    if (!fragranceFamily) errors.push("Família olfativa vazia.");

    const categoryName = cellOf(row, "category") || null;
    const priceRaw = cellOf(row, "price");
    const price = priceRaw ? parseBRLNumber(priceRaw) : 0;
    const stockRaw = cellOf(row, "stock");
    const stock = stockRaw ? Math.max(0, Math.round(parseBRLNumber(stockRaw))) : 0;
    const description = cellOf(row, "description");

    return {
      line: rowIndex + 2, // +1 pelo cabeçalho, +1 porque a planilha começa em 1
      name,
      brandName,
      gender,
      fragranceType,
      volumeMl,
      categoryName,
      fragranceFamily,
      price,
      stock,
      description,
      errors,
    };
  });
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  const baseSlug = slugify(base) || "produto";
  let slug = baseSlug;
  let suffix = 2;
  while (taken.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
  taken.add(slug);
  return slug;
}
