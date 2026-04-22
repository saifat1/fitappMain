import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./BookingPages.module.css";
import { availabilityApi } from "../shared/api/availabilityApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
  TrainerAvailabilityException,
  TrainerAvailabilityRule,
  TrainerAvailabilityRulesResponse,
  UpdateTrainerAvailabilityRequest,
} from "../features/availability/model/availability.types";

const DAY_OPTIONS = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

function buildDefaultRules(): TrainerAvailabilityRule[] {
  return DAY_OPTIONS.map((day) => ({
    dayOfWeek: day.value,
    startTime: "09:00:00",
    endTime: "18:00:00",
    slotDurationMinutes: 60,
    active: true,
  }));
}

function normalizeRules(
    response: TrainerAvailabilityRulesResponse | null
): TrainerAvailabilityRule[] {
  const defaults = buildDefaultRules();
  const map = new Map<number, TrainerAvailabilityRule>();

  for (const rule of response?.rules ?? []) {
    map.set(rule.dayOfWeek, {
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotDurationMinutes: rule.slotDurationMinutes,
      active: rule.active,
    });
  }

  return defaults.map((item) => map.get(item.dayOfWeek) ?? item);
}

function normalizeExceptions(
    response: TrainerAvailabilityRulesResponse | null
): TrainerAvailabilityException[] {
  return [...(response?.exceptions ?? [])].sort((a, b) => {
    const left = `${a.date} ${a.startTime}`;
    const right = `${b.date} ${b.startTime}`;
    return left.localeCompare(right);
  });
}

function buildEmptyException(): TrainerAvailabilityException {
  return {
    date: "",
    startTime: "09:00:00",
    endTime: "10:00:00",
    comment: "",
  };
}

function toTimeInputValue(value: string): string {
  return value ? value.slice(0, 5) : "";
}

function toTimeApiValue(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function formatExceptionLabel(item: TrainerAvailabilityException): string {
  if (!item.date) {
    return "Новая запись";
  }

  const date = new Date(item.date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${date} · ${toTimeInputValue(item.startTime)} — ${toTimeInputValue(
      item.endTime
  )}`;
}

export default function TrainerAvailabilityPage() {
  const [rules, setRules] = useState<TrainerAvailabilityRule[]>(buildDefaultRules());
  const [exceptions, setExceptions] = useState<TrainerAvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sortedRules = useMemo(
      () => [...rules].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      [rules]
  );

  const sortedExceptions = useMemo(
      () =>
          [...exceptions].sort((a, b) => {
            const left = `${a.date} ${a.startTime}`;
            const right = `${b.date} ${b.startTime}`;
            return left.localeCompare(right);
          }),
      [exceptions]
  );

  async function loadRules() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await availabilityApi.getMyAvailabilityRules();
      setRules(normalizeRules(response));
      setExceptions(normalizeExceptions(response));
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось загрузить доступность"
        );
      } else {
        setErrorMessage("Не удалось загрузить доступность");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRules();
  }, []);

  const updateRule = (
      dayOfWeek: number,
      patch: Partial<TrainerAvailabilityRule>
  ) => {
    setRules((current) =>
        current.map((rule) =>
            rule.dayOfWeek === dayOfWeek ? { ...rule, ...patch } : rule
        )
    );
  };

  const addException = () => {
    setExceptions((current) => [...current, buildEmptyException()]);
  };

  const updateException = (
      index: number,
      patch: Partial<TrainerAvailabilityException>
  ) => {
    setExceptions((current) =>
        current.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const removeException = (index: number) => {
    setExceptions((current) => current.filter((_, idx) => idx !== index));
  };

  const validateBeforeSave = (): string | null => {
    for (const rule of rules) {
      if (!rule.startTime || !rule.endTime) {
        return "Во всех правилах должно быть заполнено время";
      }
      if (rule.active && rule.startTime >= rule.endTime) {
        return "У активного правила время окончания должно быть больше времени начала";
      }
      if (rule.active && (!rule.slotDurationMinutes || rule.slotDurationMinutes < 15)) {
        return "Длительность активного слота должна быть не меньше 15 минут";
      }
    }

    for (const item of exceptions) {
      if (!item.date) {
        return "У исключения не заполнена дата";
      }
      if (!item.startTime || !item.endTime) {
        return "У исключения не заполнено время";
      }
      if (item.startTime >= item.endTime) {
        return "У исключения время окончания должно быть больше времени начала";
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateBeforeSave();
    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

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

    try {
      const response = await availabilityApi.updateMyAvailabilityRules(payload);
      setRules(normalizeRules(response));
      setExceptions(normalizeExceptions(response));
      setSuccessMessage("Доступность и исключения сохранены");
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось сохранить доступность"
        );
      } else {
        setErrorMessage("Не удалось сохранить доступность");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Доступность тренера</h1>
          <p className={styles.subtitle}>
            Настрой рабочие интервалы по дням недели и добавляй исключения на
            конкретные даты.
          </p>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Правила по дням недели</h2>

          {isLoading && <div className={styles.empty}>Загрузка...</div>}

          {!isLoading && (
              <div className={styles.requestsList}>
                {sortedRules.map((rule) => {
                  const dayLabel =
                      DAY_OPTIONS.find((item) => item.value === rule.dayOfWeek)?.label ??
                      `День ${rule.dayOfWeek}`;

                  return (
                      <div key={rule.dayOfWeek} className={styles.requestCard}>
                        <div className={styles.requestHeader}>
                          <div>
                            <strong>{dayLabel}</strong>
                            <div className={styles.subtitle}>
                              {rule.active
                                  ? `Активно · ${toTimeInputValue(rule.startTime)} — ${toTimeInputValue(
                                      rule.endTime
                                  )} · слот ${rule.slotDurationMinutes} мин`
                                  : "Выключено"}
                            </div>
                          </div>

                          <select
                              className={styles.select}
                              value={rule.active ? "true" : "false"}
                              onChange={(event) =>
                                  updateRule(rule.dayOfWeek, {
                                    active: event.target.value === "true",
                                  })
                              }
                          >
                            <option value="true">Активно</option>
                            <option value="false">Выключено</option>
                          </select>
                        </div>

                        <div className={styles.controls}>
                          <div className={styles.field}>
                            <label className={styles.label}>Начало</label>
                            <input
                                className={styles.input}
                                type="time"
                                step={60}
                                value={toTimeInputValue(rule.startTime)}
                                onChange={(event) =>
                                    updateRule(rule.dayOfWeek, {
                                      startTime: toTimeApiValue(event.target.value),
                                    })
                                }
                            />
                          </div>

                          <div className={styles.field}>
                            <label className={styles.label}>Конец</label>
                            <input
                                className={styles.input}
                                type="time"
                                step={60}
                                value={toTimeInputValue(rule.endTime)}
                                onChange={(event) =>
                                    updateRule(rule.dayOfWeek, {
                                      endTime: toTimeApiValue(event.target.value),
                                    })
                                }
                            />
                          </div>

                          <div className={styles.field}>
                            <label className={styles.label}>Слот, минут</label>
                            <input
                                className={styles.input}
                                type="number"
                                min={15}
                                step={15}
                                value={rule.slotDurationMinutes}
                                onChange={(event) =>
                                    updateRule(rule.dayOfWeek, {
                                      slotDurationMinutes: Number(event.target.value),
                                    })
                                }
                            />
                          </div>
                        </div>

                        <div className={styles.inlineActions}>
                          <button
                              type="button"
                              className={styles.buttonSecondary}
                              onClick={() =>
                                  updateRule(rule.dayOfWeek, {
                                    startTime: "09:00:00",
                                    endTime: "18:00:00",
                                    slotDurationMinutes: 60,
                                  })
                              }
                          >
                            Сбросить день
                          </button>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.requestHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Исключения по датам</h2>
              <p className={styles.subtitle}>
                Закрой конкретный интервал на определённую дату.
              </p>
            </div>

            <button
                type="button"
                className={styles.buttonSecondary}
                onClick={addException}
            >
              Добавить исключение
            </button>
          </div>

          {sortedExceptions.length === 0 && (
              <div className={styles.empty}>Исключений пока нет.</div>
          )}

          {sortedExceptions.length > 0 && (
              <div className={styles.requestsList}>
                {sortedExceptions.map((item, index) => (
                    <div
                        key={`${item.date}-${item.startTime}-${item.endTime}-${index}`}
                        className={styles.requestCard}
                    >
                      <div className={styles.requestHeader}>
                        <div>
                          <strong>{formatExceptionLabel(item)}</strong>
                          <div className={styles.subtitle}>
                            Заблокированный интервал
                          </div>
                        </div>

                        <button
                            type="button"
                            className={styles.buttonDanger}
                            onClick={() => removeException(index)}
                        >
                          Удалить
                        </button>
                      </div>

                      <div className={styles.controls}>
                        <div className={styles.field}>
                          <label className={styles.label}>Дата</label>
                          <input
                              className={styles.input}
                              type="date"
                              value={item.date}
                              onChange={(event) =>
                                  updateException(index, {
                                    date: event.target.value,
                                  })
                              }
                          />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Начало</label>
                          <input
                              className={styles.input}
                              type="time"
                              step={60}
                              value={toTimeInputValue(item.startTime)}
                              onChange={(event) =>
                                  updateException(index, {
                                    startTime: toTimeApiValue(event.target.value),
                                  })
                              }
                          />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Конец</label>
                          <input
                              className={styles.input}
                              type="time"
                              step={60}
                              value={toTimeInputValue(item.endTime)}
                              onChange={(event) =>
                                  updateException(index, {
                                    endTime: toTimeApiValue(event.target.value),
                                  })
                              }
                          />
                        </div>
                      </div>

                      <div className={styles.fieldWide}>
                        <label className={styles.label}>Комментарий</label>
                        <textarea
                            className={styles.textarea}
                            value={item.comment ?? ""}
                            onChange={(event) =>
                                updateException(index, {
                                  comment: event.target.value,
                                })
                            }
                            placeholder="Например: отпуск, совещание, личные дела"
                        />
                      </div>
                    </div>
                ))}
              </div>
          )}

          <div className={styles.inlineActions}>
            <button
                type="button"
                className={styles.button}
                onClick={handleSave}
                disabled={isSaving || isLoading}
            >
              {isSaving ? "Сохраняем..." : "Сохранить доступность"}
            </button>

            <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => {
                  setRules(buildDefaultRules());
                  setExceptions([]);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={isSaving}
            >
              Очистить форму
            </button>
          </div>
        </section>
      </div>
  );
}