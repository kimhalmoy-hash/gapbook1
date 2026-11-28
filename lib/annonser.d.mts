export const ADSENSE_AKTIV: boolean;
export const UTGIVER_ID: string;
export const ENHET_IDER: { H: string; R: string };
export function adsenseAktiv(env?: Record<string, string | undefined>): boolean;
export const PLASS_FORMAT: Record<string, "H" | "R">;
export const RESERVERT_HOYDE: { H: number; R: number };
export const RUTE_KINDER: string[];
export const UTELATT_KINDER: string[];
export const TREDJE_PLASS_MIN_KORT: number;
export const MAKS_PLASSER: number;
export function annonsePlasser(side: {
  kind: string;
  indekserbar: boolean;
  antallKort: number;
  tom: boolean;
  ukerader?: number;
}): string[];
