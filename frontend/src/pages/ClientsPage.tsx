import { useEffect, useState } from "react";
import axios from "axios";
import { trainerApi } from "../shared/api/trainerApi";
import type {
    TrainerClientResponse,
    UpdateTrainerClientRequest,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type EditState = {
    firstName: string;
    lastName: string;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [editState, setEditState] = useState<EditState>({
        firstName: "",
        lastName: "",
    });
    const [savingClientId, setSavingClientId] = useState<number | null>(null);
    const [deactivatingClientId, setDeactivatingClientId] = useState<number | null>(null);

    async function loadClients() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить клиентов");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadClients();
    }, []);

    const startEditing = (client: TrainerClientResponse) => {
        setEditingClientId(client.id);
        setEditState({
            firstName: client.firstName ?? "",
            lastName: client.lastName ?? "",
        });
    };

    const cancelEditing = () => {
        setEditingClientId(null);
        setEditState({
            firstName: "",
            lastName: "",
        });
    };

    const handleSave = async (clientId: number) => {
        setErrorMessage("");
        setSavingClientId(clientId);

        const payload: UpdateTrainerClientRequest = {
            firstName: editState.firstName,
            lastName: editState.lastName,
        };

        try {
            const updated = await trainerApi.updateClient(clientId, payload);

            setClients((prev) =>
                prev.map((client) => (client.id === clientId ? updated : client))
            );

            cancelEditing();
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось обновить клиента");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setSavingClientId(null);
        }
    };

    const handleDeactivate = async (clientId: number) => {
        const confirmed = window.confirm("Деактивировать клиента?");
        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setDeactivatingClientId(clientId);

        try {
            await trainerApi.deactivateClient(clientId);

            setClients((prev) =>
                prev.map((client) =>
                    client.id === clientId ? { ...client, status: "INACTIVE" } : client
                )
            );
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось деактивировать клиента");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setDeactivatingClientId(null);
        }
    };

    return (
        <div className="page-card page-card-wide">
            <div className="page-header-row">
                <div>
                    <h2>Клиенты тренера</h2>
                    <p className="page-description">Список клиентов текущего тренера.</p>
                </div>

                <button onClick={loadClients} disabled={isLoading}>
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </div>

            {isLoading && <p>Загрузка...</p>}
            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {!isLoading && !errorMessage && clients.length === 0 && (
                <p>Клиентов пока нет.</p>
            )}

            {!isLoading && !errorMessage && clients.length > 0 && (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Имя</th>
                            <th>Фамилия</th>
                            <th>Статус</th>
                            <th>Создан</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clients.map((client) => {
                            const isEditing = editingClientId === client.id;
                            const isSaving = savingClientId === client.id;
                            const isDeactivating = deactivatingClientId === client.id;

                            return (
                                <tr key={client.id}>
                                    <td>{client.id}</td>
                                    <td>{client.email}</td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editState.firstName}
                                                onChange={(event) =>
                                                    setEditState((prev) => ({
                                                        ...prev,
                                                        firstName: event.target.value,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            client.firstName ?? "-"
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editState.lastName}
                                                onChange={(event) =>
                                                    setEditState((prev) => ({
                                                        ...prev,
                                                        lastName: event.target.value,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            client.lastName ?? "-"
                                        )}
                                    </td>

                                    <td>{client.status}</td>
                                    <td>{new Date(client.createdAt).toLocaleString()}</td>

                                    <td>
                                        <div className="table-actions">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSave(client.id)}
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? "Сохраняем..." : "Сохранить"}
                                                    </button>
                                                    <button onClick={cancelEditing} disabled={isSaving}>
                                                        Отмена
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(client)}>
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeactivate(client.id)}
                                                        disabled={isDeactivating || client.status === "INACTIVE"}
                                                    >
                                                        {isDeactivating ? "Деактивируем..." : "Деактивировать"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}