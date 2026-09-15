import FbTextField from "../../../shared/ui/FbTextField";
import type { TrainerProfileResponse } from "../model/trainerProfile.types";

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
        <>
            <div className="fb-section-title fb-section-title--flush">Основная информация</div>
            <div className="fb-hint">
                Фото профиля — следующим шагом. Пока показываются инициалы.
            </div>

            {successMessage ? <div className="fb-success-note">{successMessage}</div> : null}
            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            <FbTextField
                id="trainer-profile-first-name"
                label="Имя"
                value={firstName}
                onChange={onFirstNameChange}
            />

            <FbTextField
                id="trainer-profile-last-name"
                label="Фамилия"
                value={lastName}
                onChange={onLastNameChange}
            />

            <FbTextField
                id="trainer-profile-phone"
                label="Телефон"
                value={phone}
                onChange={onPhoneChange}
                placeholder="+7 ..."
            />

            <div className="fb-readonly">
                <span className="fb-readonly__label">Email</span>
                <span className="fb-readonly__value">{profile.email}</span>
            </div>

            <button
                type="button"
                className="fb-btn fb-btn--primary fb-form-submit"
                onClick={onSave}
                disabled={isSaving}
            >
                {isSaving ? "Сохраняем…" : "Сохранить"}
            </button>

            <button
                type="button"
                className="fb-btn fb-btn--ghost"
                style={{ marginTop: 10 }}
                onClick={onReset}
                disabled={isSaving}
            >
                Отменить
            </button>
        </>
    );
}
