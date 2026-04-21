import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./BookingPages.module.css";
import { clientTrainerApi } from "../shared/api/clientTrainerApi";
import { availabilityApi } from "../shared/api/availabilityApi";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import type { ClientTrainerResponse } from "../features/clienttrainer/model/clienttrainer.types";
import type {
  AvailabilitySlot,
  TrainerAvailabilityCalendarResponse,
} from "../features/availability/model/availability.types";
import type {
  BookingRequestResponse,
  CreateBookingRequest,
} from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function startOfWeek(date: Date): Date {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function formatDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(date: string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatSelectedDayTitle(date: string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

function getTrainerName(trainer: ClientTrainerResponse): string {
  const fullName = [trainer.trainerFirstName, trainer.trainerLastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  return fullName || trainer.trainerEmail;
}

function getStatusLabel(status: BookingRequestResponse["status"]): string {
  switch (status) {
    case "PENDING":
      return "На согласовании";
    case "APPROVED":
      return "Подтверждено";
    case "DECLINED":
      return "Отклонено";
    case "CANCELLED":
      return "Отменено";
    default:
      return status;
  }
}

function getBadgeClass(status: BookingRequestResponse["status"]): string {
  switch (status) {
    case "PENDING":
      return `${styles.badge} ${styles.badgePending}`;
    case "APPROVED":
      return `${styles.badge} ${styles.badgeApproved}`;
    case "DECLINED":
      return `${styles.badge} ${styles.badgeDeclined}`;
    case "CANCELLED":
      return `${styles.badge} ${styles.badgeCancelled}`;
    default:
      return styles.badge;
  }
}

function makeSlotKey(trainerId: number, start: string, end: string): string {
  return `${trainerId}|${start}|${end}`;
}

function getSlotBadgeClass(
    stylesMap: Record<string, string>,
    slotStatus: AvailabilitySlot["status"],
    localRequestStatus?: BookingRequestResponse["status"]
): string {
  if (localRequestStatus === "APPROVED") {
    return `${stylesMap.slotBadge} ${stylesMap.slotBadgeApproved}`;
  }

  if (localRequestStatus === "PENDING") {
    return `${stylesMap.slotBadge} ${stylesMap.slotBadgePending}`;
  }

  if (slotStatus === "BUSY") {
    return `${stylesMap.slotBadge} ${stylesMap.slotBadgeBusy}`;
  }

  if (slotStatus === "PAST") {
    return `${stylesMap.slotBadge} ${stylesMap.slotBadgePast}`;
  }

  return `${stylesMap.slotBadge} ${stylesMap.slotBadgeFree}`;
}

function getSlotStatusText(
    slotStatus: AvailabilitySlot["status"],
    localRequestStatus?: BookingRequestResponse["status"]
): string {
  if (localRequestStatus === "APPROVED") {
    return "Запись подтверждена";
  }

  if (localRequestStatus === "PENDING") {
    return "Запрос отправлен";
  }

  if (slotStatus === "BUSY") {
    return "Занято";
  }

  if (slotStatus === "PAST") {
    return "Прошло";
  }

  return "Свободно";
}

export default function ClientBookingPage() {
  const [trainers, setTrainers] = useState<ClientTrainerResponse[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [calendar, setCalendar] = useState<TrainerAvailabilityCalendarResponse | null>(
      null
  );
  const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalSlot, setModalSlot] = useState<AvailabilitySlot | null>(null);
  const [comment, setComment] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  async function loadRequests(): Promise<void> {
    const data = await bookingRequestApi.getMyBookingRequests();
    setRequests(data);
  }

  async function loadTrainers(): Promise<void> {
    const data = await clientTrainerApi.getMyTrainers();
    setTrainers(data);

    if (data.length > 0) {
      setSelectedTrainerId((current) => current ?? data[0].trainerId);
    }
  }

  async function loadCalendar(
      trainerId: number,
      from: Date,
      to: Date
  ): Promise<void> {
    setIsCalendarLoading(true);

    try {
      const data = await availabilityApi.getTrainerAvailability(
          trainerId,
          formatDateOnly(from),
          formatDateOnly(to)
      );
      setCalendar(data);
    } finally {
      setIsCalendarLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap(): Promise<void> {
      setErrorMessage("");
      setIsLoading(true);

      try {
        await Promise.all([loadTrainers(), loadRequests()]);
      } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          setErrorMessage(
              error.response?.data?.message ?? "Не удалось загрузить данные"
          );
        } else {
          setErrorMessage("Не удалось загрузить данные");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (selectedTrainerId == null) {
      setCalendar(null);
      return;
    }

    setModalSlot(null);
    setComment("");
    setSuccessMessage("");
    setErrorMessage("");

    void loadCalendar(selectedTrainerId, weekStart, weekEnd).catch((error) => {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось загрузить расписание"
        );
      } else {
        setErrorMessage("Не удалось загрузить расписание");
      }
    });
  }, [selectedTrainerId, weekStart, weekEnd]);

  const selectedTrainer = useMemo(
      () => trainers.find((trainer) => trainer.trainerId === selectedTrainerId) ?? null,
      [trainers, selectedTrainerId]
  );

  const trainerNameById = useMemo(() => {
    const map = new Map<number, string>();

    for (const trainer of trainers) {
      map.set(trainer.trainerId, getTrainerName(trainer));
    }

    return map;
  }, [trainers]);

  const requestStatusBySlot = useMemo(() => {
    const map = new Map<string, BookingRequestResponse["status"]>();

    for (const request of requests) {
      if (request.status !== "PENDING" && request.status !== "APPROVED") {
        continue;
      }

      const key = makeSlotKey(
          request.trainerId,
          request.requestedStart,
          request.requestedEnd
      );

      if (request.status === "APPROVED") {
        map.set(key, "APPROVED");
      } else if (!map.has(key)) {
        map.set(key, "PENDING");
      }
    }

    return map;
  }, [requests]);

  const visibleDays = useMemo(() => {
    const todayKey = formatDateOnly(new Date());
    const result: { date: string; slots: AvailabilitySlot[] }[] = [];

    for (let i = 0; i < 7; i += 1) {
      const date = formatDateOnly(addDays(weekStart, i));

      if (date < todayKey) {
        continue;
      }

      const slots = (calendar?.slots ?? []).filter(
          (slot) => slot.start.slice(0, 10) === date
      );

      result.push({ date, slots });
    }

    return result;
  }, [calendar, weekStart]);

  useEffect(() => {
    if (visibleDays.length === 0) {
      setSelectedDate("");
      return;
    }

    const currentStillVisible = visibleDays.some((day) => day.date === selectedDate);
    if (currentStillVisible) {
      return;
    }

    const firstWithSlots =
        visibleDays.find((day) => day.slots.length > 0)?.date ?? visibleDays[0].date;

    setSelectedDate(firstWithSlots);
  }, [visibleDays, selectedDate]);

  const selectedDay = useMemo(
      () => visibleDays.find((day) => day.date === selectedDate) ?? null,
      [visibleDays, selectedDate]
  );

  const handleCreateRequest = async (): Promise<void> => {
    if (selectedTrainerId == null || modalSlot == null) {
      return;
    }

    const existingStatus = requestStatusBySlot.get(
        makeSlotKey(selectedTrainerId, modalSlot.start, modalSlot.end)
    );

    if (existingStatus === "PENDING" || existingStatus === "APPROVED") {
      setErrorMessage("Запрос на этот слот уже существует");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const payload: CreateBookingRequest = {
      trainerId: selectedTrainerId,
      requestedStart: modalSlot.start,
      requestedEnd: modalSlot.end,
      clientComment: comment.trim() || undefined,
    };

    try {
      await bookingRequestApi.createMyBookingRequest(payload);
      setComment("");
      setModalSlot(null);
      setSuccessMessage("Запрос на запись отправлен");

      await Promise.all([
        loadRequests(),
        loadCalendar(selectedTrainerId, weekStart, weekEnd),
      ]);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось отправить запрос"
        );
      } else {
        setErrorMessage("Не удалось отправить запрос");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: number): Promise<void> => {
    if (selectedTrainerId == null) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setCancellingId(requestId);

    try {
      await bookingRequestApi.cancelMyBookingRequest(requestId);
      setSuccessMessage("Запрос отменён");

      await Promise.all([
        loadRequests(),
        loadCalendar(selectedTrainerId, weekStart, weekEnd),
      ]);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось отменить запрос"
        );
      } else {
        setErrorMessage("Не удалось отменить запрос");
      }
    } finally {
      setCancellingId(null);
    }
  };

  return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Запись к тренеру</h1>
          <p className={styles.subtitle}>
            Выбери тренера, день и свободный слот.
          </p>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Параметры просмотра</h2>
          <p className={styles.sectionLead}>
            На телефоне блоки собраны в вертикальный сценарий: тренер → неделя → день →
            слот.
          </p>

          <div className={styles.controls}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="trainerId">
                Тренер
              </label>

              <select
                  id="trainerId"
                  className={styles.select}
                  value={selectedTrainerId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedTrainerId(value ? Number(value) : null);
                  }}
                  disabled={isLoading || trainers.length === 0}
              >
                {trainers.length === 0 && <option value="">Нет доступных тренеров</option>}
                {trainers.map((trainer) => (
                    <option key={trainer.trainerId} value={trainer.trainerId}>
                      {getTrainerName(trainer)}
                    </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldWide}>
              <div className={styles.label}>Неделя</div>

              <div className={styles.weekNav}>
                <div className={styles.weekNavButtons}>
                  <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => setWeekStart((current) => addDays(current, -7))}
                  >
                    ← Пред. неделя
                  </button>

                  <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => setWeekStart(startOfWeek(new Date()))}
                  >
                    Текущая неделя
                  </button>

                  <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => setWeekStart((current) => addDays(current, 7))}
                  >
                    След. неделя →
                  </button>
                </div>

                <div className={styles.periodPill}>
                  {formatDateOnly(weekStart)} — {formatDateOnly(weekEnd)}
                </div>
              </div>
            </div>
          </div>

          {selectedTrainer && (
              <div className={styles.mobileTrainerBar}>
                <div className={styles.mobileTrainerName}>
                  {getTrainerName(selectedTrainer)}
                </div>
                <div className={styles.mobileTrainerMeta}>Выбранный тренер</div>
              </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Выбери день</h2>
          <p className={styles.subtitle}>
            Показываются только текущий и будущие дни выбранной недели.
          </p>

          {isLoading || isCalendarLoading ? (
              <div className={styles.empty}>Загрузка расписания...</div>
          ) : visibleDays.length === 0 ? (
              <div className={styles.empty}>В этой неделе доступных дней нет.</div>
          ) : (
              <>
                <div className={styles.dayTabs}>
                  {visibleDays.map((day) => {
                    const freeCount = day.slots.filter((slot) => {
                      const localRequestStatus =
                          selectedTrainerId != null
                              ? requestStatusBySlot.get(
                                  makeSlotKey(selectedTrainerId, slot.start, slot.end)
                              )
                              : undefined;

                      return (
                          slot.status === "FREE" &&
                          localRequestStatus !== "PENDING" &&
                          localRequestStatus !== "APPROVED"
                      );
                    }).length;

                    const isActive = day.date === selectedDate;

                    return (
                        <button
                            key={day.date}
                            type="button"
                            className={`${styles.dayTab} ${isActive ? styles.dayTabActive : ""}`}
                            onClick={() => setSelectedDate(day.date)}
                        >
                          <strong>{formatDayLabel(day.date)}</strong>
                          <span className={styles.dayTabMeta}>
                      {freeCount > 0 ? `Свободно: ${freeCount}` : "Нет свободных"}
                    </span>
                        </button>
                    );
                  })}
                </div>

                <div className={styles.slotSection}>
                  <h3 className={styles.sectionTitle}>
                    {selectedDate
                        ? `Слоты на ${formatSelectedDayTitle(selectedDate)}`
                        : "Слоты дня"}
                  </h3>

                  {!selectedDay && (
                      <div className={styles.empty}>Выбери день для просмотра слотов.</div>
                  )}

                  {selectedDay && selectedDay.slots.length === 0 && (
                      <div className={styles.empty}>На выбранный день слоты не заданы.</div>
                  )}

                  {selectedDay && selectedDay.slots.length > 0 && (
                      <div className={styles.slotList}>
                        {selectedDay.slots.map((slot) => {
                          const localRequestStatus =
                              selectedTrainerId != null
                                  ? requestStatusBySlot.get(
                                      makeSlotKey(selectedTrainerId, slot.start, slot.end)
                                  )
                                  : undefined;

                          const canSelect =
                              slot.status === "FREE" &&
                              localRequestStatus !== "PENDING" &&
                              localRequestStatus !== "APPROVED";

                          const slotClassNames = [
                            styles.slot,
                            slot.status === "BUSY" ? styles.slotBusy : "",
                            slot.status === "PAST" ? styles.slotPast : "",
                            localRequestStatus === "PENDING" ? styles.slotRequested : "",
                            localRequestStatus === "APPROVED" ? styles.slotApprovedLocal : "",
                            modalSlot?.start === slot.start && modalSlot?.end === slot.end
                                ? styles.slotSelected
                                : "",
                          ]
                              .filter(Boolean)
                              .join(" ");

                          return (
                              <div key={`${slot.start}-${slot.end}`} className={slotClassNames}>
                                <div className={styles.slotMeta}>
                                  <div className={styles.slotTime}>
                                    {formatTime(slot.start)} — {formatTime(slot.end)}
                                  </div>

                                  <div className={styles.slotBadgeRow}>
                            <span
                                className={getSlotBadgeClass(
                                    styles,
                                    slot.status,
                                    localRequestStatus
                                )}
                            >
                              {getSlotStatusText(slot.status, localRequestStatus)}
                            </span>
                                  </div>
                                </div>

                                <div className={styles.slotAction}>
                                  {canSelect ? (
                                      <button
                                          type="button"
                                          className={styles.button}
                                          onClick={() => {
                                            setModalSlot(slot);
                                            setComment("");
                                          }}
                                      >
                                        Записаться
                                      </button>
                                  ) : (
                                      <button
                                          type="button"
                                          className={styles.buttonSecondary}
                                          disabled
                                      >
                                        Недоступно
                                      </button>
                                  )}
                                </div>
                              </div>
                          );
                        })}
                      </div>
                  )}
                </div>
              </>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Мои запросы</h2>

          {requests.length === 0 ? (
              <div className={styles.empty}>Запросов пока нет.</div>
          ) : (
              <div className={styles.requestsList}>
                {requests.map((request) => (
                    <article key={request.id} className={styles.requestCard}>
                      <div className={styles.requestHeader}>
                        <div>
                          <div className={styles.label}>
                            {trainerNameById.get(request.trainerId) ??
                                `Тренер #${request.trainerId}`}
                          </div>

                          <div className={styles.requestMeta}>
                            <div>
                              {formatDateTime(request.requestedStart)} —{" "}
                              {formatTime(request.requestedEnd)}
                            </div>
                            {request.clientComment && <div>{request.clientComment}</div>}
                            {request.trainerComment && <div>{request.trainerComment}</div>}
                          </div>
                        </div>

                        <span className={getBadgeClass(request.status)}>
                    {getStatusLabel(request.status)}
                  </span>
                      </div>

                      {(request.status === "PENDING" || request.status === "APPROVED") && (
                          <div className={styles.inlineActions}>
                            <button
                                type="button"
                                className={styles.buttonDanger}
                                onClick={() => void handleCancelRequest(request.id)}
                                disabled={cancellingId === request.id}
                            >
                              {cancellingId === request.id ? "Отменяем..." : "Отменить"}
                            </button>
                          </div>
                      )}
                    </article>
                ))}
              </div>
          )}
        </section>

        {modalSlot && (
            <div
                className={styles.modalOverlay}
                onClick={() => {
                  if (!isSubmitting) {
                    setModalSlot(null);
                    setComment("");
                  }
                }}
            >
              <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div>
                    <h3 className={styles.modalTitle}>Запрос на запись</h3>
                    <p className={styles.subtitle}>
                      {selectedTrainer ? getTrainerName(selectedTrainer) : "Тренер"}
                    </p>
                  </div>

                  <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => {
                        if (!isSubmitting) {
                          setModalSlot(null);
                          setComment("");
                        }
                      }}
                  >
                    Закрыть
                  </button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>
                    {formatDateTime(modalSlot.start)} — {formatTime(modalSlot.end)}
                  </div>
                </div>

                <div className={styles.fieldWide}>
                  <label className={styles.label} htmlFor="clientComment">
                    Комментарий
                  </label>

                  <textarea
                      id="clientComment"
                      className={styles.textarea}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Например: хочу силовую тренировку"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                      type="button"
                      className={styles.button}
                      onClick={handleCreateRequest}
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? "Отправляем..." : "Отправить запрос"}
                  </button>

                  <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => {
                        if (!isSubmitting) {
                          setModalSlot(null);
                          setComment("");
                        }
                      }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}