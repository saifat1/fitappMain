import { useEffect, useState } from "react";
import { reminderSettingsApi } from "../../../shared/api/reminderSettingsApi";

type Props = {
    /** What the reminders are for this role — shown under the title. */
    hint: string;
    className?: string;
};

/** FIT-75: profile switch «Напоминать о тренировках». Hidden until the current value is loaded. */
export default function ReminderSettingsRow({ hint, className = "fb-row" }: Props) {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        reminderSettingsApi
            .get()
            .then((settings) => setEnabled(settings.enabled))
            .catch(() => undefined);
    }, []);

    if (enabled === null) {
        return null;
    }

    const handleChange = async (next: boolean) => {
        setEnabled(next);
        setIsSaving(true);
        try {
            const saved = await reminderSettingsApi.update(next);
            setEnabled(saved.enabled);
        } catch {
            setEnabled(!next);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <label className={className}>
            <span className="fb-row__main">
                <span className="fb-row__title">Напоминать о тренировках</span>
                <span className="fb-row__sub">{hint}</span>
            </span>
            <input
                type="checkbox"
                className="fb-switch"
                checked={enabled}
                disabled={isSaving}
                onChange={(event) => void handleChange(event.target.checked)}
            />
        </label>
    );
}
