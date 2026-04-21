import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./BookingPages.module.css";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type FilterMode = "PENDING" | "ALL";

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

function getClientLabel(request: BookingRequestResponse): string {
  const fullName = [request.clientFirstName, request.clientLastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  return fullName || request.clientEmail || `Клиент #${request.clientId}`;
}

export default function TrainerBookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("PENDING");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadRequests() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await bookingRequestApi.getTrainerBookingRequests();
      setRequests(data);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось загрузить запросы"
        );
      } else {
        setErrorMessage("Не удалось загрузить запросы");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  const pendingRequests = useMemo(
      () =>
          [...requests]
              .filter((request) => request.status === "PENDING")
              .sort(
                  (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
      [requests]
  );

  const processedRequests = useMemo(
      () =>
          [...requests]
              .filter((request) => request.status !== "PENDING")
              .sort(
                  (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
      [requests]
  );

  const visibleRequests = useMemo(() => {
    if (filterMode === "PENDING") {
      return pendingRequests;
    }

    return [...pendingRequests, ...processedRequests];
  }, [filterMode, pendingRequests, processedRequests]);

  const review = async (id: number, action: "approve" | "decline") => {
    setProcessingId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        trainerComment: comments[id]?.trim() || undefined,
      };

      if (action === "approve") {
        await bookingRequestApi.approveBookingRequest(id, payload);
        setSuccessMessage(`Запрос #${id} подтверждён`);
      } else {
        await bookingRequestApi.declineBookingRequest(id, payload);
        setSuccessMessage(`Запрос #${id} отклонён`);
      }

      await loadRequests();
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setErrorMessage(
            error.response?.data?.message ?? "Не удалось обработать запрос"
        );
      } else {
        setErrorMessage("Не удалось обработать запрос");
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Запросы на запись</h1>
          <p className={styles.subtitle}>
            Смотри новые запросы клиентов, подтверждай или отклоняй их.
          </p>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <section className={styles.card}>
          <div className={styles.controls}>
            <button
                type="button"
                className={
                  filterMode === "PENDING" ? styles.button : styles.buttonSecondary
                }
                onClick={() => setFilterMode("PENDING")}
            >
              Только новые
            </button>

            <button
                type="button"
                className={
                  filterMode === "ALL" ? styles.button : styles.buttonSecondary
                }
                onClick={() => setFilterMode("ALL")}
            >
              Все запросы
            </button>

            <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => void loadRequests()}
                disabled={isLoading}
            >
              {isLoading ? "Обновляем..." : "Обновить"}
            </button>
          </div>

          <p className={styles.subtitle}>
            Новых: {pendingRequests.length} · Обработанных: {processedRequests.length}
          </p>

          {isLoading && <div className={styles.empty}>Загрузка...</div>}

          {!isLoading && visibleRequests.length === 0 && (
              <div className={styles.empty}>Запросов для выбранного фильтра нет.</div>
          )}

          {!isLoading && visibleRequests.length > 0 && (
              <div className={styles.requestsList}>
                {visibleRequests.map((request) => (
                    <div key={request.id} className={styles.requestCard}>
                      <div className={styles.requestHeader}>
                        <div>
                          <strong>Запрос #{request.id}</strong>
                          <div className={styles.subtitle}>{getClientLabel(request)}</div>
                          <div className={styles.subtitle}>
                            {formatDateTime(request.requestedStart)} —{" "}
                            {formatTime(request.requestedEnd)}
                          </div>
                        </div>

                        <span className={getBadgeClass(request.status)}>
                    {getStatusLabel(request.status)}
                  </span>
                      </div>

                      <div>Комментарий клиента: {request.clientComment || "—"}</div>
                      <div>Комментарий тренера: {request.trainerComment || "—"}</div>

                      {request.status === "PENDING" && (
                          <div className={styles.page}>
                            <div className={styles.fieldWide}>
                              <label className={styles.label} htmlFor={`comment-${request.id}`}>
                                Комментарий тренера
                              </label>
                              <textarea
                                  id={`comment-${request.id}`}
                                  className={styles.textarea}
                                  value={comments[request.id] ?? ""}
                                  onChange={(event) =>
                                      setComments((current) => ({
                                        ...current,
                                        [request.id]: event.target.value,
                                      }))
                                  }
                                  placeholder="Например: подтверждаю на указанный слот"
                              />
                            </div>

                            <div className={styles.inlineActions}>
                              <button
                                  type="button"
                                  className={styles.button}
                                  onClick={() => void review(request.id, "approve")}
                                  disabled={processingId === request.id}
                              >
                                Подтвердить
                              </button>

                              <button
                                  type="button"
                                  className={styles.buttonDanger}
                                  onClick={() => void review(request.id, "decline")}
                                  disabled={processingId === request.id}
                              >
                                Отклонить
                              </button>
                            </div>
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </section>
      </div>
  );
}