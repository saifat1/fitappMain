import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./BookingPages.module.css";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

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

function getClientDisplayName(request: BookingRequestResponse): string {
  const fullName = [request.clientFirstName, request.clientLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || request.clientEmail || `Клиент #${request.clientId}`;
}

type RequestCardProps = {
  request: BookingRequestResponse;
  comment: string;
  processingId: number | null;
  onCommentChange: (id: number, value: string) => void;
  onApprove?: (id: number) => void;
  onDecline?: (id: number) => void;
};

function RequestCard({
  request,
  comment,
  processingId,
  onCommentChange,
  onApprove,
  onDecline,
}: RequestCardProps) {
  return (
    <div className={styles.requestCard}>
      <div className={styles.requestHeader}>
        <div>
          <strong>Запрос #{request.id}</strong>
          <div className={styles.subtitle}>{getClientDisplayName(request)}</div>
          <div className={styles.subtitle}>{request.clientEmail || "—"}</div>
          <div className={styles.subtitle}>
            {formatDateTime(request.requestedStart)} — {formatTime(request.requestedEnd)}
          </div>
        </div>

        <span className={getBadgeClass(request.status)}>
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div>Комментарий клиента: {request.clientComment || "—"}</div>
      <div>Комментарий тренера: {request.trainerComment || "—"}</div>

      {request.status === "PENDING" && onApprove && onDecline && (
        <div className={styles.page}>
          <div className={styles.fieldWide}>
            <label className={styles.label} htmlFor={`comment-${request.id}`}>
              Комментарий тренера
            </label>
            <textarea
              id={`comment-${request.id}`}
              className={styles.textarea}
              value={comment}
              onChange={(event) => onCommentChange(request.id, event.target.value)}
              placeholder="Например: подтверждаю на указанный слот"
            />
          </div>

          <div className={styles.inlineActions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => onApprove(request.id)}
              disabled={processingId === request.id}
            >
              Подтвердить
            </button>

            <button
              type="button"
              className={styles.buttonDanger}
              onClick={() => onDecline(request.id)}
              disabled={processingId === request.id}
            >
              Отклонить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerBookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
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
    () => requests.filter((request) => request.status === "PENDING"),
    [requests]
  );

  const processedRequests = useMemo(
    () => requests.filter((request) => request.status !== "PENDING"),
    [requests]
  );

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
          Подтверждай или отклоняй входящие запросы клиентов.
        </p>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <section className={styles.card}>
        <div className={styles.inlineActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => void loadRequests()}
            disabled={isLoading}
          >
            {isLoading ? "Обновляем..." : "Обновить"}
          </button>
        </div>

        {isLoading && <div className={styles.empty}>Загрузка...</div>}

        {!isLoading && requests.length === 0 && (
          <div className={styles.empty}>Запросов пока нет.</div>
        )}

        {!isLoading && requests.length > 0 && (
          <div className={styles.page}>
            <div>
              <h2 className={styles.sectionTitle}>Новые запросы</h2>
              {pendingRequests.length === 0 ? (
                <div className={styles.empty}>Новых запросов нет.</div>
              ) : (
                <div className={styles.requestsList}>
                  {pendingRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      comment={comments[request.id] ?? ""}
                      processingId={processingId}
                      onCommentChange={(id, value) =>
                        setComments((current) => ({
                          ...current,
                          [id]: value,
                        }))
                      }
                      onApprove={(id) => void review(id, "approve")}
                      onDecline={(id) => void review(id, "decline")}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className={styles.sectionTitle}>Обработанные запросы</h2>
              {processedRequests.length === 0 ? (
                <div className={styles.empty}>Обработанных запросов пока нет.</div>
              ) : (
                <div className={styles.requestsList}>
                  {processedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      comment={comments[request.id] ?? ""}
                      processingId={processingId}
                      onCommentChange={(id, value) =>
                        setComments((current) => ({
                          ...current,
                          [id]: value,
                        }))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
