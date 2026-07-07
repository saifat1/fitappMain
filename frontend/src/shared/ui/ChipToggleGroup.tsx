type Option = { code: string; label: string };

type Props = {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (next: string[]) => void;
};

export default function ChipToggleGroup({ label, options, selected, onChange }: Props) {
    const safeSelected = selected ?? [];

    const toggle = (code: string) => {
        if (safeSelected.includes(code)) {
            onChange(safeSelected.filter((c) => c !== code));
        } else {
            onChange([...safeSelected, code]);
        }
    };

    return (
        <div className="fb-field-group">
            <div className="fb-field-group__label">{label}</div>
            <div className="fb-chips fb-chips--wrap">
                {options.map((option) => (
                    <button
                        key={option.code}
                        type="button"
                        className={`fb-chip ${safeSelected.includes(option.code) ? "fb-chip--active" : ""}`}
                        onClick={() => toggle(option.code)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
