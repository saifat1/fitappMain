export type ClientMeasurementResponse = {
    id: number;
    measuredAt: string;
    weightKg: number | null;
    neckCm: number | null;
    chestCm: number | null;
    waistCm: number | null;
    hipsCm: number | null;
    bicepsRightCm: number | null;
    bicepsLeftCm: number | null;
    forearmCm: number | null;
    thighCm: number | null;
    calfRightCm: number | null;
    calfLeftCm: number | null;
    notes: string | null;
};

export type SaveClientMeasurementRequest = {
    measuredAt: string;
    weightKg?: number | null;
    neckCm?: number | null;
    chestCm?: number | null;
    waistCm?: number | null;
    hipsCm?: number | null;
    bicepsRightCm?: number | null;
    bicepsLeftCm?: number | null;
    forearmCm?: number | null;
    thighCm?: number | null;
    calfRightCm?: number | null;
    calfLeftCm?: number | null;
    notes?: string | null;
};

export const MEASUREMENT_FIELDS: { key: keyof ClientMeasurementResponse; label: string }[] = [
    { key: "weightKg", label: "Вес" },
    { key: "neckCm", label: "Шея" },
    { key: "chestCm", label: "Грудная клетка" },
    { key: "waistCm", label: "Талия" },
    { key: "hipsCm", label: "Таз" },
    { key: "bicepsRightCm", label: "Бицепс правый" },
    { key: "bicepsLeftCm", label: "Бицепс левый" },
    { key: "forearmCm", label: "Предплечье" },
    { key: "thighCm", label: "Бедро" },
    { key: "calfRightCm", label: "Голень правая" },
    { key: "calfLeftCm", label: "Голень левая" },
];
