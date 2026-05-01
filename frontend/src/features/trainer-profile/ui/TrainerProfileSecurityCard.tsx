import PasswordInput from "../../../shared/ui/PasswordInput";
import styles from "./TrainerProfile.module.css";

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
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Безопасность</h2>
                    <p className={styles.cardSubtitle}>
                        Смена пароля для входа в приложение.
                    </p>
                </div>
            </div>

            {successMessage && <div className={styles.messageSuccess}>{successMessage}</div>}
            {errorMessage && <div className={styles.messageError}>{errorMessage}</div>}

            <div className={styles.formGrid}>
                <div className={styles.fieldFull}>
                    <label className={styles.label} htmlFor="trainer-password-current">
                        Текущий пароль
                    </label>
                    <PasswordInput
                        id="trainer-password-current"
                        value={currentPassword}
                        onChange={onCurrentPasswordChange}
                        autoComplete="current-password"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-password-new">
                        Новый пароль
                    </label>
                    <PasswordInput
                        id="trainer-password-new"
                        value={newPassword}
                        onChange={onNewPasswordChange}
                        autoComplete="new-password"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-password-confirm">
                        Подтверждение
                    </label>
                    <PasswordInput
                        id="trainer-password-confirm"
                        value={confirmPassword}
                        onChange={onConfirmPasswordChange}
                        autoComplete="new-password"
                    />
                </div>

                <div className={styles.fieldFull}>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-primary"
                            onClick={onSubmit}
                            disabled={isChanging}
                        >
                            {isChanging ? "Меняем..." : "Сменить пароль"}
                        </button>

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={onReset}
                            disabled={isChanging}
                        >
                            Очистить
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}