import { useEffect, useState } from "react";
import axios from "axios";
import { trainerApi } from "../shared/api/trainerApi";
import type {
    CreateInviteRequest,
    InviteResponse,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

export default function InvitesPage() {
    const [invites, setInvites] = useState<InviteResponse[]>([]);
    const [email, setEmail] = useState("client@test.local");
    const [expiresInDays, setExpiresInDays] = useState("7");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);

    async function loadInvites() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainerApi.getInvites();
            setInvites(data);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить приглашения");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadInvites();
    }, []);

    const handleCreateInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const payload: CreateInviteRequest = {
            email: email.trim() || undefined,
            expiresInDays: expiresInDays.trim() ? Number(expiresInDays) : undefined,
        };

        try {
            const created = await trainerApi.createInvite(payload);
            setInvites((prev) => [created, ...prev]);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось создать приглашение");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async (invite: InviteResponse) => {
        try {
            await navigator.clipboard.writeText(invite.registrationLink);
            setCopiedInviteId(invite.id);

            window.setTimeout(() => {
                setCopiedInviteId((current) => (current === invite.id ? null : current));
            }, 1500);
        } catch {
            setErrorMessage("Не удалось скопировать ссылку");
        }
    };

    return (
        <div className="page-card page-card-wide">
            <div className="page-header-row">
                <div>
                    <h2>Приглашения</h2>
                    <p className="page-description">
                        Создание и просмотр invite-ссылок для клиентов.
                    </p>
                </div>

                <button onClick={loadInvites} disabled={isLoading}>
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </div>

            <form className="form section-block" onSubmit={handleCreateInvite}>
                <div className="form-row">
                    <label htmlFor="invite-email">Email клиента</label>
                    <input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="client@test.local"
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="invite-expiration">Срок действия, дней</label>
                    <input
                        id="invite-expiration"
                        type="number"
                        min="1"
                        max="365"
                        value={expiresInDays}
                        onChange={(event) => setExpiresInDays(event.target.value)}
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Создаём..." : "Создать invite"}
                </button>
            </form>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {isLoading && <p>Загрузка...</p>}

            {!isLoading && invites.length === 0 && <p>Приглашений пока нет.</p>}

            {!isLoading && invites.length > 0 && (
                <div className="invite-list">
                    {invites.map((invite) => (
                        <div key={invite.id} className="invite-card">
                            <div><strong>ID:</strong> {invite.id}</div>
                            <div><strong>Email:</strong> {invite.email ?? "-"}</div>
                            <div><strong>Статус:</strong> {invite.status}</div>
                            <div><strong>Истекает:</strong> {new Date(invite.expiresAt).toLocaleString()}</div>
                            <div>
                                <strong>Used at:</strong>{" "}
                                {invite.usedAt ? new Date(invite.usedAt).toLocaleString() : "-"}
                            </div>

                            <div className="invite-link-block">
                                <strong>Ссылка:</strong>
                                <input type="text" readOnly value={invite.registrationLink} />
                            </div>

                            <div className="invite-actions">
                                <button onClick={() => handleCopy(invite)}>
                                    {copiedInviteId === invite.id ? "Скопировано" : "Копировать ссылку"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}