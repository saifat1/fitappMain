import { useMemo, Fragment } from "react";
import TrainingEvent from "../ui/TrainingEvent";
import DutyIcon from "./DutyIcon";
import {
    buildHourSlots,
    mergeDutySlotsIntoBlocks,
    getDutyHourSet,
} from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";
import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";

type Props = {
    dayTrainings: TrainingResponse[];
    dayDutySlots: TrainerDutySlotResponse[];
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime: string) => void;
    onDeleteDutyBlock: (slotIds: number[], label: string) => void;
    processingDutyKey: string | null;
    startHour?: number;
    endHour?: number;
};

function trainingHour(training: TrainingResponse, startHour: number): number | null {
    if (!training.startTime) return null;
    const hour = Number(training.startTime.slice(0, 2));
    return Number.isFinite(hour) ? Math.max(hour, startHour) : null;
}

export default function DayTimeline({
    dayTrainings,
    dayDutySlots,
    onOpenTraining,
    onQuickAdd,
    onDeleteDutyBlock,
    processingDutyKey,
    startHour = 8,
    endHour = 21,
}: Props) {
    const hours = useMemo(() => buildHourSlots(startHour, endHour), [startHour, endHour]);

    const byHour = useMemo(() => {
        const map = new Map<number, TrainingResponse[]>();
        for (const training of dayTrainings) {
            const hour = trainingHour(training, startHour);
            const bucket = hour ?? startHour;
            const list = map.get(bucket) ?? [];
            list.push(training);
            map.set(bucket, list);
        }
        return map;
    }, [dayTrainings, startHour]);

    // Duty slots always merge into one continuous banner — it never splits
    // into per-hour segments. If any hour within its range has a training,
    // the whole banner narrows to half width for its entire span, leaving
    // room on the right for the training(s); otherwise it stays full width.
    const dutyBlocks = useMemo(() => {
        const blocks = mergeDutySlotsIntoBlocks(dayDutySlots);
        return blocks.map((block) => {
            let hasConflict = false;
            for (let h = block.startHour; h < block.startHour + block.hours; h += 1) {
                if (byHour.has(h)) {
                    hasConflict = true;
                    break;
                }
            }
            return { ...block, hasConflict };
        });
    }, [dayDutySlots, byHour]);

    // Any hour that has a duty slot narrows its training card and pushes it
    // to the right, since the duty banner covering that hour is narrowed too.
    const dutyHourSet = useMemo(() => getDutyHourSet(dayDutySlots), [dayDutySlots]);

    return (
        <div className="fb-timeline">
            <div
                className="fb-timeline__grid"
                style={{ gridTemplateRows: `repeat(${hours.length}, minmax(64px, auto))` }}
            >
                {/* Duty banners render first in the DOM so hour rows (and the
                    trainings inside them) paint on top and stay clickable. */}
                {dutyBlocks.map((block) => {
                    const startRow = Math.max(0, block.startHour - startHour) + 1;
                    const endRow = startRow + block.hours;
                    const dutyKey = `${block.dutyDate}-${block.startTime}`;
                    const isBusy = processingDutyKey === dutyKey;
                    const label = `${block.startTime}–${block.endTime}`;

                    return (
                        <button
                            key={block.key}
                            type="button"
                            className={`fb-duty-block ${block.hasConflict ? "fb-duty-block--narrow" : ""} ${isBusy ? "fb-duty-block--busy" : ""}`}
                            style={{ gridRow: `${startRow} / ${endRow}` }}
                            disabled={isBusy}
                            onClick={() => onDeleteDutyBlock(block.slotIds, label)}
                            title="Нажмите, чтобы снять дежурство"
                        >
                            <span className="fb-duty-block__icon"><DutyIcon /></span>
                            <span className="fb-duty-block__label">Дежурство</span>
                            <span className="fb-duty-block__time">{label}</span>
                        </button>
                    );
                })}

                {hours.map((label, rowIndex) => {
                    const hour = Number(label.slice(0, 2));
                    const events = byHour.get(hour) ?? [];
                    const row = rowIndex + 1;
                    const hasDuty = dutyHourSet.has(hour);

                    return (
                        <Fragment key={label}>
                            <div className="fb-timeline__hour" style={{ gridRow: row }}>
                                {label}
                            </div>

                            <button
                                type="button"
                                className="fb-timeline__add"
                                style={{ gridRow: row }}
                                aria-label={`Добавить запись на ${label}`}
                                onClick={() => onQuickAdd(label)}
                            />

                            <div className="fb-timeline__lane" style={{ gridRow: row }}>
                                {events.map((training) => (
                                    <TrainingEvent
                                        key={training.id}
                                        training={training}
                                        compact={hasDuty}
                                        onClick={onOpenTraining}
                                    />
                                ))}
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
