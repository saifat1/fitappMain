import { useEffect, useState } from "react";
import axios from "axios";
import TrainerProfileHeader from "../features/trainer-profile/ui/TrainerProfileHeader";
import TrainerProfileInfoCard from "../features/trainer-profile/ui/TrainerProfileInfoCard";
import TrainerProfileSecurityCard from "../features/trainer-profile/ui/TrainerProfileSecurityCard";
import TrainerProfileReportsCard from "../features/trainer-profile/ui/TrainerProfileReportsCard";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";
import type {
    TrainerProfileResponse,
    TrainerReportFilters,
    TrainerReportsResponse,
} from "../features/trainer-profile/model/trainerProfile.types";
import { trainerProfileApi } from "../shared/api/trainerProfileApi";
import { trainerApi } from "../shared/api/trainerApi";
import styles from "../features/trainer-profile/ui/TrainerProfile.module.css";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getDefaultReportFilters(): TrainerReportFilters {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 30);

    const toIso = today.toISOString().slice(0, 10);
    const fromIso = from.toISOString().slice(0, 10);

    return {
        from: fromIso,
        to: toIso,
        clientId: "",
        status: "ALL",
    };
}

export default function TrainerProfilePage() {
    const [profile, setProfile] = useState<TrainerProfileResponse | null>(null);
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    const [pageError, setPageError] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
    const [profileErrorMessage, setProfileErrorMessage] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

    const [reportFilters, setReportFilters] = useState<TrainerReportFilters>(
        getDefaultReportFilters()
    );
    const [reports, setReports] = useState<TrainerReportsResponse | null>(null);
    const [reportsErrorMessage, setReportsErrorMessage] = useState("");

    useEffect(() => {
        async function bootstrap() {
            setPageError("");
            setIsLoading(true);

            try {
                const [profileData, clientsData] = await Promise.all([
                    trainerProfileApi.getProfile(),
                    trainerApi.getClients(),
                ]);

                setProfile(profileData);
                setClients(clientsData);
                setFirstName(profileData.firstName ?? "");
                setLastName(profileData.lastName ?? "");
                setPhone(profileData.phone ?? "");
            } catch (error) {
                setPageError(resolveApiError(error, "Не удалось загрузить профиль тренера"));
            } finally {
                setIsLoading(false);
            }
        }

        void bootstrap();
    }, []);

    useEffect(() => {
        void loadReports(getDefaultReportFilters());
    }, []);

    async function loadReports(filters: TrainerReportFilters) {
        setReportsErrorMessage("");
        setIsLoadingReports(true);

        try {
            const data = await trainerProfileApi.getReports({
                from: filters.from || undefined,
                to: filters.to || undefined,
                clientId: filters.clientId ? Number(filters.clientId) : undefined,
                status: filters.status !== "ALL" ? filters.status : undefined,
            });

            setReports(data);
        } catch (error) {
            setReportsErrorMessage(resolveApiError(error, "Не удалось загрузить отчёты"));
        } finally {
            setIsLoadingReports(false);
        }
    }

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
        if (!profile) {
            return;
        }

        setProfileErrorMessage("");
        setProfileSuccessMessage("");
        setIsSavingProfile(true);

        try {
            const updated = await trainerProfileApi.updateProfile({
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                phone: phone.trim() || undefined,
            });

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

    const handleResetPassword = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrorMessage("");
        setPasswordSuccessMessage("");
    };

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            setPasswordErrorMessage("Укажи текущий пароль");
            return;
        }

        if (!newPassword.trim()) {
            setPasswordErrorMessage("Укажи новый пароль");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordErrorMessage("Новый пароль должен содержать минимум 6 символов");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrorMessage("Подтверждение пароля не совпадает");
            return;
        }

        setPasswordErrorMessage("");
        setPasswordSuccessMessage("");
        setIsChangingPassword(true);

        try {
            await trainerProfileApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setPasswordSuccessMessage("Пароль успешно изменён");
            handleResetPassword();
            setPasswordSuccessMessage("Пароль успешно изменён");
        } catch (error) {
            setPasswordErrorMessage(resolveApiError(error, "Не удалось сменить пароль"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleApplyReports = async () => {
        await loadReports(reportFilters);
    };

    const handleResetReports = async () => {
        const defaults = getDefaultReportFilters();
        setReportFilters(defaults);
        await loadReports(defaults);
    };

    if (isLoading) {
        return <div className="dashboard-page">Загрузка...</div>;
    }

    if (!profile) {
        return (
            <div className="dashboard-page">
                {pageError && <div className="error-box">{pageError}</div>}
                <div className="dashboard-card">Профиль тренера не найден</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {pageError && <div className="error-box">{pageError}</div>}

            <TrainerProfileHeader profile={profile} />

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
                onReset={handleResetPassword}
            />

            <TrainerProfileReportsCard
                clients={clients}
                filters={reportFilters}
                reports={reports}
                isLoading={isLoadingReports}
                errorMessage={reportsErrorMessage}
                onFilterChange={(key, value) =>
                    setReportFilters((prev) => ({
                        ...prev,
                        [key]: value,
                    }))
                }
                onApply={handleApplyReports}
                onReset={handleResetReports}
            />
        </div>
    );
}