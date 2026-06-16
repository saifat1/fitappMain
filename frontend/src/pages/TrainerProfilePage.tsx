import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import axios from "axios";
import { useAuth } from "../features/auth/model/AuthContext";
import MobileShell from "../widgets/MobileShell";
import Avatar from "../shared/ui/Avatar";
import { avatarColor } from "../features/calendar/lib/calendarWeek";
import TrainerProfileInfoCard from "../features/trainer-profile/ui/TrainerProfileInfoCard";
import TrainerProfileSecurityCard from "../features/trainer-profile/ui/TrainerProfileSecurityCard";
import TrainerSalaryReportSection from "../features/salary-report/ui/TrainerSalaryReportSection";
import styles from "../features/trainer-profile/ui/TrainerProfile.module.css";
import { trainerProfileApi } from "../shared/api/trainerProfileApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ChangeTrainerPasswordRequest,
    TrainerProfileResponse,
    UpdateTrainerProfileRequest,
} from "../features/trainer-profile/model/trainerProfile.types";


type ProfileTab = "info" | "security" | "reports";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getDisplayName(profile: TrainerProfileResponse | null, fallbackEmail?: string | null): string {
    if (!profile) {
        return fallbackEmail || "Тренер";
    }

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return fullName || profile.email || fallbackEmail || "Тренер";
}

function getHeroInitials(profile: TrainerProfileResponse | null, fallbackEmail?: string | null): string {
    const first = profile?.firstName?.[0] ?? "";
    const last = profile?.lastName?.[0] ?? "";
    const initials = `${first}${last}`.trim().toUpperCase();

    if (initials) {
        return initials;
    }

    return profile?.email?.[0]?.toUpperCase() ?? fallbackEmail?.[0]?.toUpperCase() ?? "T";
}

function buildTabButtonStyle(isActive: boolean): CSSProperties {
    return {
        minHeight: 42,
        padding: "0 14px",
        borderRadius: 12,
        border: isActive ? "1px solid #14b8a6" : "1px solid #d7deea",
        background: isActive ? "rgba(20, 184, 166, 0.08)" : "#ffffff",
        color: isActive ? "#0f766e" : "#0f172a",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
    };
}

export default function TrainerProfilePage() {
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<ProfileTab>("info");

    const [profile, setProfile] = useState<TrainerProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
    const [profileErrorMessage, setProfileErrorMessage] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

    const displayName = useMemo(
        () => getDisplayName(profile, currentUser?.email),
        [profile, currentUser?.email]
    );

    const heroInitials = useMemo(
        () => getHeroInitials(profile, currentUser?.email),
        [profile, currentUser?.email]
    );

    const loadProfile = async () => {
        setIsLoading(true);
        setProfileErrorMessage("");

        try {
            const data = await trainerProfileApi.getProfile();
            setProfile(data);
            setFirstName(data.firstName ?? "");
            setLastName(data.lastName ?? "");
            setPhone(data.phone ?? "");
        } catch (error) {
            setProfileErrorMessage(resolveApiError(error, "Не удалось загрузить профиль тренера"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadProfile();
    }, []);

    const handleResetProfile = () => {
        if (!profile) {
            return;
        }

        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setPhone(profile.phone ?? "");
        setProfileErrorMessage("");
        setProfileSuccessMessage("");
    };

    const handleSaveProfile = async () => {
        const payload: UpdateTrainerProfileRequest = {
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            phone: phone.trim() || undefined,
        };

        setIsSavingProfile(true);
        setProfileErrorMessage("");
        setProfileSuccessMessage("");

        try {
            const updated = await trainerProfileApi.updateProfile(payload);
            setProfile(updated);
            setFirstName(updated.firstName ?? "");
            setLastName(updated.lastName ?? "");
            setPhone(updated.phone ?? "");
            setProfileSuccessMessage("Профиль сохранён");
        } catch (error) {
            setProfileErrorMessage(resolveApiError(error, "Не удалось сохранить профиль"));
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleResetPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrorMessage("");
        setPasswordSuccessMessage("");
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordErrorMessage("Заполни все поля пароля");
            setPasswordSuccessMessage("");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrorMessage("Подтверждение нового пароля не совпадает");
            setPasswordSuccessMessage("");
            return;
        }

        const payload: ChangeTrainerPasswordRequest = {
            currentPassword,
            newPassword,
            confirmPassword,
        };

        setIsChangingPassword(true);
        setPasswordErrorMessage("");
        setPasswordSuccessMessage("");

        try {
            await trainerProfileApi.changePassword(payload);
            setPasswordSuccessMessage("Пароль успешно изменён");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setPasswordErrorMessage(resolveApiError(error, "Не удалось изменить пароль"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading && !profile) {
        return (
            <MobileShell title="Профиль">
                <div className="fb-empty">Загрузка профиля…</div>
            </MobileShell>
        );
    }

    if (!profile) {
        return (
            <MobileShell title="Профиль">
                <div className="fb-cal-error">
                    {profileErrorMessage || "Профиль тренера не найден"}
                </div>
            </MobileShell>
        );
    }

    return (
        <MobileShell title="Профиль">
            <div className="fb-profile-hero">
                <Avatar
                    initials={heroInitials}
                    color={avatarColor(profile.id ?? 0)}
                    size="md"
                />
                <div className="fb-profile-hero__name">{displayName}</div>
                <div className="fb-profile-hero__email">{profile.email}</div>
                {profile.phone ? (
                    <div className="fb-profile-hero__email">{profile.phone}</div>
                ) : null}
            </div>

            <section className={styles.card}>
                <div className={styles.tabRow}>
                    <button
                        type="button"
                        style={buildTabButtonStyle(activeTab === "info")}
                        onClick={() => setActiveTab("info")}
                    >
                        О себе
                    </button>

                    <button
                        type="button"
                        style={buildTabButtonStyle(activeTab === "security")}
                        onClick={() => setActiveTab("security")}
                    >
                        Безопасность
                    </button>

                    <button
                        type="button"
                        style={buildTabButtonStyle(activeTab === "reports")}
                        onClick={() => setActiveTab("reports")}
                    >
                        Отчёты
                    </button>
                </div>
            </section>

            {activeTab === "info" && (
                <TrainerProfileInfoCard
                    profile={profile}
                    firstName={firstName}
                    lastName={lastName}
                    phone={phone}
                    isSaving={isSavingProfile}
                    successMessage={profileSuccessMessage}
                    errorMessage={profileErrorMessage}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onPhoneChange={setPhone}
                    onSave={handleSaveProfile}
                    onReset={handleResetProfile}
                />
            )}

            {activeTab === "security" && (
                <TrainerProfileSecurityCard
                    currentPassword={currentPassword}
                    newPassword={newPassword}
                    confirmPassword={confirmPassword}
                    isChanging={isChangingPassword}
                    successMessage={passwordSuccessMessage}
                    errorMessage={passwordErrorMessage}
                    onCurrentPasswordChange={setCurrentPassword}
                    onNewPasswordChange={setNewPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    onSubmit={handleChangePassword}
                    onReset={handleResetPasswordForm}
                />
            )}

            {activeTab === "reports" && <TrainerSalaryReportSection />}
        </MobileShell>
    );
}