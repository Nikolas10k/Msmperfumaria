export interface ExpressRegion {
  id: string;
  name: string;
  cepRangeStart: string;
  cepRangeEnd: string;
  fee: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  cutoffTime: string; // "HH:MM:SS" ou "HH:MM"
  activeWeekdays: number[]; // 0=domingo .. 6=sábado
  isActive: boolean;
}

export type ExpressUnavailableReason =
  | "cep_fora_da_area"
  | "regiao_inativa"
  | "dia_indisponivel"
  | "horario_limite_passou";

export type ExpressCheckResult =
  | {
      available: true;
      region: ExpressRegion;
      deliveryEstimateLabel: string;
    }
  | {
      available: false;
      reason: ExpressUnavailableReason;
      region?: ExpressRegion;
      nextAvailableLabel?: string;
    };

const WEEKDAY_LABELS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, "").padStart(8, "0").slice(0, 8);
}

function parseCutoffMinutes(cutoff: string): number {
  const [h, m] = cutoff.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function findRegionForCep(cep: string, regions: ExpressRegion[]): ExpressRegion | undefined {
  const normalized = normalizeCep(cep);
  return regions.find(
    (region) =>
      normalized >= normalizeCep(region.cepRangeStart) &&
      normalized <= normalizeCep(region.cepRangeEnd),
  );
}

function nextAvailableWeekdayLabel(activeWeekdays: number[], fromWeekday: number): string {
  for (let offset = 1; offset <= 7; offset++) {
    const candidate = (fromWeekday + offset) % 7;
    if (activeWeekdays.includes(candidate)) {
      return offset === 1 ? "amanhã" : WEEKDAY_LABELS[candidate];
    }
  }
  return "em breve";
}

/**
 * Regra real de negócio: a expressa só é oferecida se o CEP estiver numa
 * região configurada pelo dono, no dia certo e antes do horário-limite —
 * nunca um prazo fixo genérico.
 */
export function checkExpressDelivery(
  cep: string,
  regions: ExpressRegion[],
  now: Date = new Date(),
): ExpressCheckResult {
  const region = findRegionForCep(cep, regions);

  if (!region) {
    return { available: false, reason: "cep_fora_da_area" };
  }

  if (!region.isActive) {
    return { available: false, reason: "regiao_inativa", region };
  }

  const currentWeekday = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const cutoffMinutes = parseCutoffMinutes(region.cutoffTime);

  if (!region.activeWeekdays.includes(currentWeekday)) {
    return {
      available: false,
      reason: "dia_indisponivel",
      region,
      nextAvailableLabel: nextAvailableWeekdayLabel(region.activeWeekdays, currentWeekday),
    };
  }

  if (currentMinutes >= cutoffMinutes) {
    return {
      available: false,
      reason: "horario_limite_passou",
      region,
      nextAvailableLabel: nextAvailableWeekdayLabel(region.activeWeekdays, currentWeekday),
    };
  }

  const deliveryEstimateLabel =
    region.deliveryDaysMin === 0 && region.deliveryDaysMax === 0
      ? "ainda hoje"
      : region.deliveryDaysMin === region.deliveryDaysMax
        ? `em até ${region.deliveryDaysMax} dia${region.deliveryDaysMax > 1 ? "s" : ""} útil`
        : `em ${region.deliveryDaysMin} a ${region.deliveryDaysMax} dias úteis`;

  return { available: true, region, deliveryEstimateLabel };
}
