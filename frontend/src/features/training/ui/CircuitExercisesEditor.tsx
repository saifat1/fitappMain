import { newStation, type CircuitStation } from "../model/circuit";
import CircuitStationEditor from "./CircuitStationEditor";

type Props = {
    stations: CircuitStation[];
    onChange: (stations: CircuitStation[]) => void;
};

export default function CircuitExercisesEditor({ stations, onChange }: Props) {
    return (
        <div className="fb-circuit">
            {stations.map((station, index) => (
                <CircuitStationEditor
                    key={station.key}
                    station={station}
                    number={index + 1}
                    onChange={(next) => onChange(stations.map((s) => (s.key === station.key ? next : s)))}
                    onRemove={() => onChange(stations.filter((s) => s.key !== station.key))}
                />
            ))}

            <button type="button" className="fb-add-link" onClick={() => onChange([...stations, newStation()])}>
                + Добавить упражнение
            </button>
        </div>
    );
}
