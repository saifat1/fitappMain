import { useMemo } from "react";
import TrainingEvent from "../ui/TrainingEvent";
import { buildHourSlots } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";

type Props = {
    dayTrainings: TrainingResponse[];
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime: string) => void;
    startHour?: number;
    endHour?: number;
};

function trainingHour(training: TrainingResponse): number | null {
    if (!training.startTime) return null;
    const hour = Number(training.startTime.slice(0, 2));
    return Number.isFinite(hour) ? hour : null;
}

export default function DayTimeline({
    dayTrainings,
    onOpenTraining,
    onQuickAdd,
    startHour = 8,
    endHour = 21,
}: Props) {
    const hours = useMemo(() => buildHourSlots(startHour, endHour), [startHour, endHour]);

    const byHour = useMemo(() => {
        const map = new Map<number, TrainingResponse[]>();
        for (const training of dayTrainings) {
            const hour = trainingHour(training);
            const bucket = hour ?? startHour;
            const list = map.get(bucket) ?? [];
            list.push(training);
            map.set(bucket, list);
        }
        return map;
    }, [dayTrainings, startHour]);

    return (
        <div className="fb-timeline">
            {hours.map((label) => {
                const hour = Number(label.slice(0, 2));
                const events = byHour.get(hour) ?? [];

                return (
                    <div key={label} className="fb-timeline__row">
                        <div className="fb-timeline__hour">{label}</div>

                        <button
                            type="button"
                            className="fb-timeline__add"
                            aria-label={`Добавить тренировку на ${label}`}
                            onClick={() => onQuickAdd(label)}
                        />

                        <div className="fb-timeline__lane">
                            {events.map((training) => (
                                <TrainingEvent
                                    key={training.id}
                                    training={training}
                                    onClick={onOpenTraining}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
