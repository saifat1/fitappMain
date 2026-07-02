import { useMemo } from "react";
import TrainingEvent from "./TrainingEvent";
import DutyIcon from "./DutyIcon";
import { WEEKDAY_LABELS } from "../lib/calendarWeek";
import { parseDateKey, mergeDutySlotsIntoBlocks, type DutyBlock } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";
import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";

type Props = {
    trainings: TrainingResponse[];
    dutySlots: TrainerDutySlotResponse[];
    processingDutyKey: string | null;
    onOpenTraining: (trainingId: number) => void;
    onDeleteDutyBlock: (slotIds: number[], label: string) => void;
};

type ScheduleItem =
    | { kind: "training"; sortMinutes: number; training: TrainingResponse }
    | { kind: "duty"; sortMinutes: number; block: DutyBlock };

function startMinutes(training: TrainingResponse): number {
    if (!training.startTime) return 24 * 60;
    const [h, m] = training.startTime.split(":").map(Number);
    return h * 60 + m;
}

function blockMinutes(block: DutyBlock): number {
    const [h, m] = block.startTime.split(":").map(Number);
    return h * 60 + m;
}

export default function ScheduleList({
    trainings,
    dutySlots,
    processingDutyKey,
    onOpenTraining,
    onDeleteDutyBlock,
}: Props) {
    const groups = useMemo(() => {
        const trainingsByDate = new Map<string, TrainingResponse[]>();
        for (const training of trainings) {
            const list = trainingsByDate.get(training.trainingDate) ?? [];
            list.push(training);
            trainingsByDate.set(training.trainingDate, list);
        }

        const dutyByDate = new Map<string, TrainerDutySlotResponse[]>();
        for (const slot of dutySlots) {
            const list = dutyByDate.get(slot.dutyDate) ?? [];
            list.push(slot);
            dutyByDate.set(slot.dutyDate, list);
        }

        const dateKeys = new Set([...trainingsByDate.keys(), ...dutyByDate.keys()]);

        return Array.from(dateKeys)
            .sort((a, b) => a.localeCompare(b))
            .map((dateKey) => {
                const dutyBlocks = mergeDutySlotsIntoBlocks(dutyByDate.get(dateKey) ?? []);

                const items: ScheduleItem[] = [
                    ...(trainingsByDate.get(dateKey) ?? []).map((training) => ({
                        kind: "training" as const,
                        sortMinutes: startMinutes(training),
                        training,
                    })),
                    ...dutyBlocks.map((block) => ({
                        kind: "duty" as const,
                        sortMinutes: blockMinutes(block),
                        block,
                    })),
                ].sort((a, b) => a.sortMinutes - b.sortMinutes);

                return { dateKey, items };
            });
    }, [trainings, dutySlots]);

    if (groups.length === 0) {
        return <div className="fb-schedule__empty">На выбранный день записей нет</div>;
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
                            {items.map((item) => {
                                if (item.kind === "training") {
                                    return (
                                        <TrainingEvent
                                            key={`training-${item.training.id}`}
                                            training={item.training}
                                            showTime
                                            onClick={onOpenTraining}
                                        />
                                    );
                                }

                                const { block } = item;
                                const dutyKey = `${block.dutyDate}-${block.startTime}`;
                                const isBusy = processingDutyKey === dutyKey;
                                const label = `${block.startTime}–${block.endTime}`;

                                return (
                                    <button
                                        key={`duty-${block.key}`}
                                        type="button"
                                        className={`fb-schedule-duty ${isBusy ? "fb-schedule-duty--busy" : ""}`}
                                        disabled={isBusy}
                                        onClick={() => onDeleteDutyBlock(block.slotIds, label)}
                                        title="Нажмите, чтобы снять дежурство"
                                    >
                                        <span className="fb-schedule-duty__icon"><DutyIcon /></span>
                                        <span className="fb-schedule-duty__body">
                                            <span className="fb-schedule-duty__title">Дежурство</span>
                                            <span className="fb-schedule-duty__time">{label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
