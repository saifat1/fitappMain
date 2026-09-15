import { useMemo, useState } from "react";
import ScheduleTrainingCard from "./ScheduleTrainingCard";
import SwipeableRow, { type SwipeAction } from "./SwipeableRow";
import NowLine from "./NowLine";
import DutyIcon from "./DutyIcon";
import CheckIcon from "../../training/ui/CheckIcon";
import CrossIcon from "../../training/ui/CrossIcon";
import { mergeDutySlotsIntoBlocks, formatDateKey, type DutyBlock } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";
import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";

type Props = {
    selectedDate: string;
    trainings: TrainingResponse[];
    dutySlots: TrainerDutySlotResponse[];
    processingDutyKey: string | null;
    onOpenTraining: (trainingId: number) => void;
    onDeleteDutyBlock: (slotIds: number[], label: string) => void;
    onCompleteTraining: (trainingId: number) => void;
    onCancelTraining: (trainingId: number) => void;
    onHideTraining: (trainingId: number) => void;
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

function hourLabelFor(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    return `${String(Math.min(hour, 23)).padStart(2, "0")}:00`;
}

export default function ScheduleList({
    selectedDate,
    trainings,
    dutySlots,
    processingDutyKey,
    onOpenTraining,
    onDeleteDutyBlock,
    onCompleteTraining,
    onCancelTraining,
    onHideTraining,
}: Props) {
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    const groups = useMemo(() => {
        const dutyBlocks = mergeDutySlotsIntoBlocks(dutySlots);

        const items: ScheduleItem[] = [
            ...trainings.map((training) => ({
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

        const byHour = new Map<string, ScheduleItem[]>();
        for (const item of items) {
            const label = hourLabelFor(item.sortMinutes);
            const list = byHour.get(label) ?? [];
            list.push(item);
            byHour.set(label, list);
        }
        return Array.from(byHour.entries());
    }, [trainings, dutySlots]);

    const isToday = selectedDate === formatDateKey(new Date());
    const nowMinutes = (() => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    })();

    if (groups.length === 0) {
        return <div className="fb-schedule__empty">На выбранный день записей нет</div>;
    }

    let nowLinePlaced = !isToday;

    return (
        <div className="fb-schedule">
            <div className="fb-schedule__items">
                {groups.map(([hourLabel, groupItems]) => {
                    const showNowLineHere = !nowLinePlaced && groupItems[0].sortMinutes > nowMinutes;
                    if (showNowLineHere) nowLinePlaced = true;

                    return (
                        <div key={hourLabel} className="fb-schedule__hour-group">
                            {showNowLineHere ? <NowLine /> : null}
                            <div className="fb-schedule__hour-label">{hourLabel}</div>

                            {groupItems.map((item) => {
                                if (item.kind === "training") {
                                    const { training } = item;
                                    const actions: SwipeAction[] =
                                        training.status === "PLANNED"
                                            ? [
                                                  {
                                                      key: "cancel",
                                                      label: "Отменена",
                                                      color: "red",
                                                      icon: <CrossIcon />,
                                                      onClick: () => onCancelTraining(training.id),
                                                  },
                                                  {
                                                      key: "complete",
                                                      label: "Проведена",
                                                      color: "green",
                                                      icon: <CheckIcon />,
                                                      onClick: () => onCompleteTraining(training.id),
                                                  },
                                              ]
                                            : training.status === "CANCELLED"
                                            ? [
                                                  {
                                                      key: "hide",
                                                      label: "Удалить",
                                                      color: "red",
                                                      icon: <CrossIcon />,
                                                      onClick: () => onHideTraining(training.id),
                                                  },
                                              ]
                                            : [];

                                    return (
                                        <SwipeableRow
                                            key={`training-${training.id}`}
                                            actions={actions}
                                            isOpen={openRowId === training.id}
                                            onOpenChange={(open) => setOpenRowId(open ? training.id : null)}
                                        >
                                            <ScheduleTrainingCard
                                                training={training}
                                                onClick={() => onOpenTraining(training.id)}
                                            />
                                        </SwipeableRow>
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
                    );
                })}

                {!nowLinePlaced ? <NowLine /> : null}
            </div>
        </div>
    );
}
