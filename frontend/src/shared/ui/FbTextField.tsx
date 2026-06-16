import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    /** Rendered at the right edge of the control row (e.g. password eye). */
    trailing?: ReactNode;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "id"
> & { id?: string };

export default function FbTextField({
    label,
    value,
    onChange,
    error,
    trailing,
    id,
    type = "text",
    ...rest
}: Props) {
    const [focused, setFocused] = useState(false);

    const rootClass = [
        "fb-field",
        focused ? "fb-field--focused" : "",
        error ? "fb-field--error" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rootClass}>
            <label className="fb-field__label" htmlFor={id}>
                {label}
            </label>

            <div className="fb-field__control">
                <input
                    id={id}
                    className="fb-field__input"
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...rest}
                />
                {trailing}
            </div>

            {error ? <div className="fb-field__error-text">{error}</div> : null}
        </div>
    );
}
