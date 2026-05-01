import type { TrainerProfileResponse } from "../model/trainerProfile.types";
import styles from "./TrainerProfile.module.css";

type Props = {
    profile: TrainerProfileResponse;
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

export default function TrainerProfileHeader({ profile }: Props) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroMain}>
                <p className="dashboard-kicker">Профиль</p>
                <h1 className="dashboard-title">Профиль тренера</h1>
                <p className="dashboard-subtitle">
                    Личные данные, безопасность и рабочие отчёты по тренировкам.
                </p>
                <div className={styles.heroMeta}>{profile.email}</div>
            </div>

            <div className={styles.heroAvatar}>
                {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Аватар тренера" />
                ) : (
                    <span>{getInitials(profile)}</span>
                )}
            </div>
        </section>
    );
}