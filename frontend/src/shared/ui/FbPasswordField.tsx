import { useState } from "react";
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

    return (
        <FbTextField
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
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
                    title={visible ? "Скрыть пароль" : "Показать пароль"}
                >
                    <EyeIcon off={!visible} />
                </button>
            }
        />
    );
}
