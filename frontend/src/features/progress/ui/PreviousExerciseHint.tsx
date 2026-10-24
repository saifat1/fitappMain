import { useEffect, useState } from "react";
import type { PreviousExercise } from "../../../shared/api/progressApi";
import { formatDate } from "../lib/progressFormat";

type Props = {
    title: string;
    load: (title: string) => Promise<PreviousExercise | null>;
};

/** FIT-76: «В прошлый раз (12 окт.): 3×8 по 70 кг» under the exercise title — what the client did last time. */
export default function PreviousExerciseHint({ title, load }: Props) {
    const [previous, setPrevious] = useState<PreviousExercise | null>(null);

    useEffect(() => {
        const trimmed = title.trim();
        let active = true;
        // Typed titles are looked up once the trainer pauses.
        const timer = window.setTimeout(() => {
            if (trimmed.length < 2) {
                setPrevious(null);
                return;
            }
            load(trimmed)
                .then((data) => active && setPrevious(data))
                .catch(() => active && setPrevious(null));
        }, 400);
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [title, load]);

    if (!previous) {
        return null;
    }

    return (
        <div className="fb-prev-hint">
            В прошлый раз ({formatDate(previous.date)}): <b>{previous.summary}</b>
        </div>
    );
}
