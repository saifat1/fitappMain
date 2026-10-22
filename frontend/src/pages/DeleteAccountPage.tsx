import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import FbPasswordField from "../shared/ui/FbPasswordField";
import { useAuth } from "../features/auth/model/AuthContext";
import { authApi } from "../shared/api/authApi";
import { publicApi } from "../shared/api/publicApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

/**
 * Account deletion (FIT-70, required by RuStore / Google Play / App Store). Public: without a session it explains
 * how to delete the account, so the stores can link to this page.
 */
export default function DeleteAccountPage() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const [password, setPassword] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [done, setDone] = useState(false);
    const [supportEmail, setSupportEmail] = useState("");

    useEffect(() => {
        publicApi.getPricing().then((data) => setSupportEmail(data.seller.email)).catch(() => undefined);
    }, []);

    const isTrainer = currentUser?.role === "TRAINER";

    const handleDelete = async () => {
        if (!password) {
            setErrorMessage("Введите пароль, чтобы подтвердить удаление");
            return;
        }

        setIsDeleting(true);
        setErrorMessage("");

        try {
            await authApi.deleteAccount(password);
            setDone(true);
            logout();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось удалить аккаунт"));
        } finally {
            setIsDeleting(false);
        }
    };

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    if (done) {
        return (
            <MobileShell title="Удаление аккаунта" showTabBar={false}>
                <div className="fb-tab-panel fb-delete-account">
                    <div className="fb-success-note">Аккаунт удалён</div>
                    <p className="fb-delete-account__text">
                        Ваши личные данные стёрты, войти в этот аккаунт больше нельзя. Спасибо, что были с нами.
                    </p>
                    <button type="button" className="fb-btn fb-btn--primary" onClick={() => navigate("/welcome", { replace: true })}>
                        На главную
                    </button>
                </div>
            </MobileShell>
        );
    }

    if (!currentUser) {
        return (
            <MobileShell title="Удаление аккаунта" left={back} showTabBar={false}>
                <div className="fb-tab-panel fb-delete-account">
                    <p className="fb-delete-account__text">
                        Удалить аккаунт можно в приложении или на сайте: войдите в аккаунт и откройте
                        «Профиль» → «Удалить аккаунт».
                    </p>
                    {supportEmail ? (
                        <p className="fb-delete-account__text">
                            Если войти не получается, напишите на <a href={`mailto:${supportEmail}`}>{supportEmail}</a> с адреса,
                            на который зарегистрирован аккаунт, — удалим вручную в течение 10 рабочих дней.
                        </p>
                    ) : null}
                    <button type="button" className="fb-btn fb-btn--primary" onClick={() => navigate("/login")}>
                        Войти
                    </button>
                </div>
            </MobileShell>
        );
    }

    return (
        <MobileShell title="Удаление аккаунта" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-delete-account">
                <p className="fb-delete-account__text">Аккаунт {currentUser.email} будет удалён без возможности восстановления.</p>

                <div className="fb-section-title fb-section-title--flush">Что удалится</div>
                <ul className="fb-delete-account__list">
                    <li>имя, электронная почта, телефон и пароль — войти в аккаунт будет нельзя;</li>
                    {isTrainer ? null : <li>анкета здоровья и измерения;</li>}
                    <li>уведомления, push-подписки и согласия.</li>
                </ul>

                <div className="fb-section-title fb-section-title--flush">Что останется без имени</div>
                <ul className="fb-delete-account__list">
                    {isTrainer ? (
                        <>
                            <li>тренировки и договоры — в истории ваших клиентов;</li>
                            <li>история оплат подписки — она нужна для чеков и налогов.</li>
                        </>
                    ) : (
                        <li>проведённые тренировки и договоры — в истории и отчётах тренера, вместо имени «Аккаунт удалён».</li>
                    )}
                </ul>

                {isTrainer ? (
                    <p className="fb-hint">
                        Подписка перестанет продлеваться, сохранённая карта будет отвязана. Возврат за неиспользованные дни — по
                        политике возврата.
                    </p>
                ) : null}

                <FbPasswordField
                    id="delete-password"
                    label="Пароль для подтверждения"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                />

                <label className="fb-delete-account__confirm">
                    <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                    <span>Понимаю, что аккаунт нельзя будет восстановить</span>
                </label>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <button
                    type="button"
                    className="fb-btn fb-btn--ghost fb-btn--danger-text fb-form-submit"
                    onClick={handleDelete}
                    disabled={!confirmed || isDeleting}
                >
                    {isDeleting ? "Удаляем…" : "Удалить аккаунт навсегда"}
                </button>
            </div>
        </MobileShell>
    );
}
