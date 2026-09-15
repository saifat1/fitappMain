import FbPasswordField from "../../../shared/ui/FbPasswordField";

type Props = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    isChanging: boolean;
    successMessage: string;
    errorMessage: string;
    onCurrentPasswordChange: (value: string) => void;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: () => void;
    onReset: () => void;
};

export default function TrainerProfileSecurityCard({
    currentPassword,
    newPassword,
    confirmPassword,
    isChanging,
    successMessage,
    errorMessage,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    onReset,
}: Props) {
    return (
        <>
            <div className="fb-section-title fb-section-title--flush">Безопасность</div>
            <div className="fb-hint">Смена пароля для входа в приложение.</div>

            {successMessage ? <div className="fb-success-note">{successMessage}</div> : null}
            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            <FbPasswordField
                id="trainer-password-current"
                label="Текущий пароль"
                value={currentPassword}
                onChange={onCurrentPasswordChange}
                autoComplete="current-password"
            />

            <FbPasswordField
                id="trainer-password-new"
                label="Новый пароль"
                value={newPassword}
                onChange={onNewPasswordChange}
                autoComplete="new-password"
            />

            <FbPasswordField
                id="trainer-password-confirm"
                label="Подтверждение"
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                autoComplete="new-password"
            />

            <button
                type="button"
                className="fb-btn fb-btn--primary fb-form-submit"
                onClick={onSubmit}
                disabled={isChanging}
            >
                {isChanging ? "Меняем…" : "Сменить пароль"}
            </button>

            <button
                type="button"
                className="fb-btn fb-btn--ghost"
                style={{ marginTop: 10 }}
                onClick={onReset}
                disabled={isChanging}
            >
                Очистить
            </button>
        </>
    );
}
