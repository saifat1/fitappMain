export type ClientQuestionnaireResponse = {
    filled: boolean;
    heightCm: number | null;
    weightKg: number | null;
    clothingSize: string | null;
    bodyFatPercent: number | null;

    healthConditions: string[];
    therapyType: string | null;

    trainingExperience: string[];
    trainingsPerWeek: number | null;

    fitnessGoals: string[];
    fitnessGoalOther: string | null;
    desiredWeightKg: number | null;

    priorityBodyParts: string[];

    convenientDays: string[];
    convenientTimeOfDay: string[];
    convenientTimeNote: string | null;

    nutritionRecommendations: string | null;
    instructorNotes: string | null;

    updatedAt: string | null;
};

export type UpdateClientQuestionnaireRequest = {
    heightCm?: number | null;
    weightKg?: number | null;
    clothingSize?: string | null;
    bodyFatPercent?: number | null;

    healthConditions: string[];
    therapyType?: string | null;

    trainingExperience: string[];
    trainingsPerWeek?: number | null;

    fitnessGoals: string[];
    fitnessGoalOther?: string | null;
    desiredWeightKg?: number | null;

    priorityBodyParts: string[];

    convenientDays: string[];
    convenientTimeOfDay: string[];
    convenientTimeNote?: string | null;

    nutritionRecommendations?: string | null;
    instructorNotes?: string | null;
};

export const HEALTH_CONDITIONS: { code: string; label: string }[] = [
    { code: "ARTHRITIS", label: "Артрит" },
    { code: "BACK_PAIN", label: "Боли в спине" },
    { code: "JOINT_PAIN", label: "Боли в суставах" },
    { code: "FOOT_PAIN", label: "Боли в стопах" },
    { code: "MUSCLE_PAIN", label: "Боли в мышцах" },
    { code: "OTHER_PAIN", label: "Другие боли" },
    { code: "DIZZINESS", label: "Головокружения и обмороки" },
    { code: "CHEST_PAIN", label: "Боль в груди" },
    { code: "SHORTNESS_OF_BREATH", label: "Отдышка" },
    { code: "HERNIA", label: "Грыжа" },
    { code: "SMOKING", label: "Курите" },
    { code: "ASTHMA", label: "Астма, бронхит" },
    { code: "BLOOD_PRESSURE", label: "Давление" },
    { code: "HEART_DISEASE", label: "Болезни сердца" },
    { code: "MUSCULOSKELETAL_DISEASE", label: "Болезни ОДА" },
    { code: "EPILEPSY", label: "Эпилепсия" },
    { code: "DIABETES", label: "Диабет" },
    { code: "PREGNANCY", label: "Беременность" },
    { code: "SURGERY_HOSPITALIZATION", label: "Операции, госпитализация" },
];

export const TRAINING_EXPERIENCE_OPTIONS: { code: string; label: string }[] = [
    { code: "SPORTS_SECTION", label: "В спортивной секции" },
    { code: "FITNESS_CLUB", label: "В фитнес клубе" },
    { code: "GYM", label: "В тренажерном зале" },
    { code: "AEROBICS_GROUP", label: "В группе аэробики" },
    { code: "PERSONAL_TRAINER", label: "С персональным тренером" },
    { code: "SELF_HOME", label: "Дома самостоятельно" },
    { code: "NEVER", label: "Никогда" },
];

export const FITNESS_GOAL_OPTIONS: { code: string; label: string }[] = [
    { code: "WEIGHT_LOSS", label: "Снижение веса" },
    { code: "MUSCLE_TONE", label: "Улучшение тонуса мышц" },
    { code: "MUSCLE_STRENGTH", label: "Увеличение мышечной силы" },
    { code: "MUSCLE_MASS", label: "Увеличение мышечной массы" },
    { code: "ENDURANCE", label: "Развитие выносливости" },
    { code: "HEALTH_IMPROVEMENT", label: "Оздоровление" },
    { code: "VACATION_SPORT_PREP", label: "Подготовка к отдыху или спорту" },
    { code: "OTHER", label: "Другая" },
];

export const PRIORITY_BODY_PART_OPTIONS: { code: string; label: string }[] = [
    { code: "ARMS", label: "Руки" },
    { code: "LEGS", label: "Ноги" },
    { code: "CHEST", label: "Грудь" },
    { code: "BACK", label: "Спина" },
    { code: "SHOULDERS", label: "Плечи" },
    { code: "ABS", label: "Живот" },
];

export const CONVENIENT_DAY_OPTIONS: { code: string; label: string }[] = [
    { code: "MON", label: "Пн" },
    { code: "TUE", label: "Вт" },
    { code: "WED", label: "Ср" },
    { code: "THU", label: "Чт" },
    { code: "FRI", label: "Пт" },
    { code: "SAT", label: "Сб" },
    { code: "SUN", label: "Вс" },
];

export const CONVENIENT_TIME_OF_DAY_OPTIONS: { code: string; label: string }[] = [
    { code: "MORNING", label: "Утро" },
    { code: "DAY", label: "День" },
    { code: "EVENING", label: "Вечер" },
];
