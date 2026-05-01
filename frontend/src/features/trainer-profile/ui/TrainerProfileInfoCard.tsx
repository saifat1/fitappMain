import type { TrainerProfileResponse } from "../model/trainerProfile.types";
import styles from "./TrainerProfile.module.css";

type Props = {
    profile: TrainerProfileResponse;
    firstName: string;
    lastName: string;
    phone: string;
    isSaving: boolean;
    successMessage: string;
    errorMessage: string;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onSave: () => void;
    onReset: () => void;
};

function getInitials(profile: TrainerProfileResponse): string {
    const first = profile.firstName?.[0] ?? "";
    const last = profile.lastName?.[0] ?? "";
    const initials = `${first}${last}`.trim().toUpperCase();

    if (initials) {
        return initials;
    }

    return profile.email?.[0]?.toUpperCase() ?? "T";
}

export default function TrainerProfileInfoCard({
                                                   profile,
                                                   firstName,
                                                   lastName,
                                                   phone,
                                                   isSaving,
                                                   successMessage,
                                                   errorMessage,
                                                   onFirstNameChange,
                                                   onLastNameChange,
                                                   onPhoneChange,
                                                   onSave,
                                                   onReset,
                                               }: Props) {
    return (
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Основная информация</h2>
                    <p className={styles.cardSubtitle}>
                        Email сейчас только для просмотра. Загрузка фото будет следующим шагом.
                    </p>
                </div>
            </div>

            {successMessage && <div className={styles.messageSuccess}>{successMessage}</div>}
            {errorMessage && <div className={styles.messageError}>{errorMessage}</div>}

            <div className={styles.infoLayout}>
                <div className={styles.avatarPanel}>
                    <div className={styles.avatarLarge}>
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Аватар тренера" />
                        ) : (
                            <span>{getInitials(profile)}</span>
                        )}
                    </div>

                    <div className={styles.avatarHint}>
                        Аватар отображается уже сейчас.
                        Загрузка и удаление фото — следующим шагом.
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="trainer-profile-first-name">
                            Имя
                        </label>
                        <input
                            id="trainer-profile-first-name"
                            className={styles.input}
                            value={firstName}
                            onChange={(event) => onFirstNameChange(event.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="trainer-profile-last-name">
                            Фамилия
                        </label>
                        <input
                            id="trainer-profile-last-name"
                            className={styles.input}
                            value={lastName}
                            onChange={(event) => onLastNameChange(event.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="trainer-profile-phone">
                            Телефон
                        </label>
                        <input
                            id="trainer-profile-phone"
                            className={styles.input}
                            value={phone}
                            onChange={(event) => onPhoneChange(event.target.value)}
                            placeholder="+7 ..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="trainer-profile-email">
                            Email
                        </label>
                        <input
                            id="trainer-profile-email"
                            className={`${styles.input} ${styles.inputReadonly}`}
                            value={profile.email}
                            readOnly
                        />
                    </div>

                    <div className={styles.fieldFull}>
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-primary"
                                onClick={onSave}
                                disabled={isSaving}
                            >
                                {isSaving ? "Сохраняем..." : "Сохранить"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={onReset}
                                disabled={isSaving}
                            >
                                Отменить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}