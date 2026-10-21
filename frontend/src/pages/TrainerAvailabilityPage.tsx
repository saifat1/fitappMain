import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MobileShell from "../widgets/MobileShell";
import BackArrowIcon from "../shared/ui/BackArrowIcon";
import { availabilityApi } from "../shared/api/availabilityApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    TrainerAvailabilityException,
    TrainerAvailabilityRule,
    TrainerAvailabilityRulesResponse,
    UpdateTrainerAvailabilityRequest,
} from "../features/availability/model/availability.types";

type Tab = "week" | "exceptions";

const DAY_OPTIONS = [
    { value: 1, label: "Понедельник" },
    { value: 2, label: "Вторник" },
    { value: 3, label: "Среда" },
    { value: 4, label: "Четверг" },
    { value: 5, label: "Пятница" },
    { value: 6, label: "Суббота" },
    { value: 7, label: "Воскресенье" },
];

const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120];

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function buildDefaultRules(): TrainerAvailabilityRule[] {
    return DAY_OPTIONS.map((day) => ({
        dayOfWeek: day.value,
        startTime: "09:00:00",
        endTime: "18:00:00",
        slotDurationMinutes: 60,
        active: true,
    }));
}

function normalizeRules(response: TrainerAvailabilityRulesResponse | null): TrainerAvailabilityRule[] {
    const map = new Map<number, TrainerAvailabilityRule>();
    for (const rule of response?.rules ?? []) {
        map.set(rule.dayOfWeek, { ...rule });
    }
    return buildDefaultRules().map((item) => map.get(item.dayOfWeek) ?? item);
}

function sortExceptions(items: TrainerAvailabilityException[]): TrainerAvailabilityException[] {
    return [...items].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

function toTimeInputValue(value: string): string {
    return value ? value.slice(0, 5) : "";
}

function toTimeApiValue(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
}

function todayIso(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function validate(rules: TrainerAvailabilityRule[], exceptions: TrainerAvailabilityException[]): string | null {
    for (const rule of rules) {
        if (!rule.active) continue;
        const day = DAY_OPTIONS.find((d) => d.value === rule.dayOfWeek)?.label ?? `День ${rule.dayOfWeek}`;
        if (!rule.startTime || !rule.endTime) return `${day}: заполните время`;
        if (rule.startTime >= rule.endTime) return `${day}: конец должен быть позже начала`;
        if (!rule.slotDurationMinutes || rule.slotDurationMinutes < 15) return `${day}: слот не меньше 15 минут`;
    }

    for (const item of exceptions) {
        if (!item.date) return "У исключения не заполнена дата";
        if (!item.startTime || !item.endTime) return "У исключения не заполнено время";
        if (item.startTime >= item.endTime) return "У исключения конец должен быть позже начала";
    }

    return null;
}

export default function TrainerAvailabilityPage() {
    const navigate = useNavigate();

    const [tab, setTab] = useState<Tab>("week");
    const [rules, setRules] = useState<TrainerAvailabilityRule[]>(buildDefaultRules());
    const [exceptions, setExceptions] = useState<TrainerAvailabilityException[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const sortedRules = useMemo(() => [...rules].sort((a, b) => a.dayOfWeek - b.dayOfWeek), [rules]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const response = await availabilityApi.getMyAvailabilityRules();
                if (!active) return;
                setRules(normalizeRules(response));
                setExceptions(sortExceptions(response?.exceptions ?? []));
            } catch (error) {
                if (active) setErrorMessage(resolveApiError(error, "Не удалось загрузить рабочее время"));
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const touch = () => {
        setSuccessMessage("");
        setErrorMessage("");
    };

    const updateRule = (dayOfWeek: number, patch: Partial<TrainerAvailabilityRule>) => {
        touch();
        setRules((current) => current.map((rule) => (rule.dayOfWeek === dayOfWeek ? { ...rule, ...patch } : rule)));
    };

    const addException = () => {
        touch();
        setExceptions((current) => [
            ...current,
            { date: todayIso(), startTime: "09:00:00", endTime: "18:00:00", comment: "" },
        ]);
    };

    const updateException = (index: number, patch: Partial<TrainerAvailabilityException>) => {
        touch();
        setExceptions((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const removeException = (index: number) => {
        touch();
        setExceptions((current) => current.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const validationError = validate(rules, exceptions);
        if (validationError) {
            setErrorMessage(validationError);
            setSuccessMessage("");
            return;
        }

        const payload: UpdateTrainerAvailabilityRequest = {
            rules: rules.map((rule) => ({
                dayOfWeek: rule.dayOfWeek,
                startTime: rule.startTime,
                endTime: rule.endTime,
                slotDurationMinutes: Number(rule.slotDurationMinutes),
                active: Boolean(rule.active),
            })),
            exceptions: exceptions.map((item) => ({
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                comment: item.comment?.trim() || undefined,
            })),
        };

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const response = await availabilityApi.updateMyAvailabilityRules(payload);
            setRules(normalizeRules(response));
            setExceptions(sortExceptions(response?.exceptions ?? []));
            setSuccessMessage("Рабочее время сохранено");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить рабочее время"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/trainer/profile", { replace: true });
        }
    };

    return (
        <MobileShell
            title="Рабочее время"
            left={
                <button type="button" className="fb-topbar__back" onClick={handleBack} aria-label="Назад">
                    <BackArrowIcon />
                </button>
            }
            showTabBar={false}
        >
            <div className="fb-segment">
                <button
                    type="button"
                    className={`fb-segment__item ${tab === "week" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setTab("week")}
                >
                    Неделя
                </button>
                <button
                    type="button"
                    className={`fb-segment__item ${tab === "exceptions" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setTab("exceptions")}
                >
                    Исключения{exceptions.length ? ` · ${exceptions.length}` : ""}
                </button>
            </div>

            <div className="fb-tab-panel">
                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : tab === "week" ? (
                    <>
                        <p className="fb-avail-hint">
                            В эти часы клиенты видят свободные слоты для записи.
                        </p>
                        {sortedRules.map((rule) => {
                            const label = DAY_OPTIONS.find((d) => d.value === rule.dayOfWeek)?.label ?? `День ${rule.dayOfWeek}`;
                            const slotOptions = SLOT_OPTIONS.includes(rule.slotDurationMinutes)
                                ? SLOT_OPTIONS
                                : [...SLOT_OPTIONS, rule.slotDurationMinutes].sort((a, b) => a - b);

                            return (
                                <div key={rule.dayOfWeek} className="fb-avail-day">
                                    <label className="fb-avail-day__head">
                                        <span className="fb-avail-day__name">{label}</span>
                                        <span className="fb-avail-day__state">{rule.active ? "Рабочий" : "Выходной"}</span>
                                        <input
                                            type="checkbox"
                                            className="fb-switch"
                                            checked={rule.active}
                                            onChange={(e) => updateRule(rule.dayOfWeek, { active: e.target.checked })}
                                        />
                                    </label>

                                    {rule.active && (
                                        <div className="fb-avail-day__times">
                                            <input
                                                className="fb-avail-input"
                                                type="time"
                                                step={60}
                                                aria-label={`${label}, начало`}
                                                value={toTimeInputValue(rule.startTime)}
                                                onChange={(e) => updateRule(rule.dayOfWeek, { startTime: toTimeApiValue(e.target.value) })}
                                            />
                                            <span className="fb-avail-day__dash">—</span>
                                            <input
                                                className="fb-avail-input"
                                                type="time"
                                                step={60}
                                                aria-label={`${label}, конец`}
                                                value={toTimeInputValue(rule.endTime)}
                                                onChange={(e) => updateRule(rule.dayOfWeek, { endTime: toTimeApiValue(e.target.value) })}
                                            />
                                            <select
                                                className="fb-avail-input fb-avail-input--slot"
                                                aria-label={`${label}, длительность слота`}
                                                value={rule.slotDurationMinutes}
                                                onChange={(e) => updateRule(rule.dayOfWeek, { slotDurationMinutes: Number(e.target.value) })}
                                            >
                                                {slotOptions.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m} мин
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <>
                        <p className="fb-avail-hint">
                            Закройте интервал на конкретную дату — в это время запись будет недоступна.
                        </p>

                        {exceptions.length === 0 && <div className="fb-empty">Исключений пока нет</div>}

                        {exceptions.map((item, index) => (
                            <div key={item.id ?? `new-${index}`} className="fb-avail-exc">
                                <div className="fb-avail-exc__row">
                                    <input
                                        className="fb-avail-input fb-avail-input--date"
                                        type="date"
                                        aria-label="Дата"
                                        value={item.date}
                                        onChange={(e) => updateException(index, { date: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="fb-row__remove"
                                        aria-label="Удалить исключение"
                                        onClick={() => removeException(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="fb-avail-day__times">
                                    <input
                                        className="fb-avail-input"
                                        type="time"
                                        step={60}
                                        aria-label="Начало"
                                        value={toTimeInputValue(item.startTime)}
                                        onChange={(e) => updateException(index, { startTime: toTimeApiValue(e.target.value) })}
                                    />
                                    <span className="fb-avail-day__dash">—</span>
                                    <input
                                        className="fb-avail-input"
                                        type="time"
                                        step={60}
                                        aria-label="Конец"
                                        value={toTimeInputValue(item.endTime)}
                                        onChange={(e) => updateException(index, { endTime: toTimeApiValue(e.target.value) })}
                                    />
                                </div>
                                <input
                                    className="fb-avail-input fb-avail-input--wide"
                                    placeholder="Комментарий: отпуск, совещание…"
                                    aria-label="Комментарий"
                                    value={item.comment ?? ""}
                                    onChange={(e) => updateException(index, { comment: e.target.value })}
                                />
                            </div>
                        ))}

                        <button type="button" className="fb-add-link" onClick={addException}>
                            + Добавить исключение
                        </button>
                    </>
                )}

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}
                {successMessage ? <div className="fb-success-note">{successMessage}</div> : null}

                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    onClick={() => void handleSave()}
                    disabled={isSaving || isLoading}
                >
                    {isSaving ? "Сохраняем…" : "Сохранить"}
                </button>
            </div>
        </MobileShell>
    );
}
