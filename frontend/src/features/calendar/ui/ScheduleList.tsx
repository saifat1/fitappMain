import { useMemo } from "react";
import TrainingEvent from "./TrainingEvent";
import { WEEKDAY_LABELS } from "../lib/calendarWeek";
import { parseDateKey } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";

type Props = {
    trainings: TrainingResponse[];
    onOpenTraining: (trainingId: number) => void;
};

function startMinutes(training: TrainingResponse): number {
    if (!training.startTime) return 24 * 60;
    const [h, m] = training.startTime.split(":").map(Number);
    return h * 60 + m;
}

export default function ScheduleList({ trainings, onOpenTraining }: Props) {
    const groups = useMemo(() => {
        const map = new Map<string, TrainingResponse[]>();

        for (const training of trainings) {
            const list = map.get(training.trainingDate) ?? [];
            list.push(training);
            map.set(training.trainingDate, list);
        }

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, items]) => ({
                dateKey,
                items: items.sort((a, b) => startMinutes(a) - startMinutes(b)),
            }));
    }, [trainings]);

    if (groups.length === 0) {
        return <div className="fb-schedule__empty">В этом месяце записей пока нет</div>;
    }

    return (
        <div className="fb-schedule">
            {groups.map(({ dateKey, items }) => {
                const date = parseDateKey(dateKey);
                const weekday = WEEKDAY_LABELS[(date.getDay() + 6) % 7];

                return (
                    <div key={dateKey} className="fb-schedule__day">
                        <div className="fb-schedule__date">
                            <div className="fb-schedule__date-num">{date.getDate()}</div>
                            <div className="fb-schedule__date-wd">{weekday}</div>
                        </div>

                        <div className="fb-schedule__items">
                            {items.map((training) => (
                                <TrainingEvent
                                    key={training.id}
                                    training={training}
                                    showTime
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
