import { useState, type MouseEvent } from "react";
import FbTextField from "./FbTextField";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    id?: string;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    disabled?: boolean;
};

/** Eye / eye-off icons matching the mockup (open eye when revealed). */
function EyeIcon({ off }: { off: boolean }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            {off ? (
                <path
                    d="M4 4l16 16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            ) : null}
        </svg>
    );
}

export default function FbPasswordField({
    label,
    value,
    onChange,
    error,
    id,
    placeholder,
    autoComplete = "current-password",
    required,
    disabled,
}: Props) {
    const [visible, setVisible] = useState(false);

    // FIT-61: a password the browser generated/autofilled ("Strong password" on iOS) stays masked
    // when only `type` changes — the browser keeps its lock on that input. So on toggle we take the
    // value straight from the DOM (autofill may not have fired onChange yet) and re-mount the input
    // via `key`, which gives a fresh element without the lock.
    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
        const input = event.currentTarget.parentElement?.querySelector("input");
        if (input && input.value !== value) {
            onChange(input.value);
        }
        setVisible((prev) => !prev);
    };

    return (
        <FbTextField
            key={visible ? "visible" : "hidden"}
            id={id}
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            trailing={
                <button
                    type="button"
                    className="fb-field__toggle"
                    onClick={toggle}
                    aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
                    title={visible ? "Скрыть пароль" : "Показать пароль"}
                >
                    <EyeIcon off={!visible} />
                </button>
            }
        />
    );
}
