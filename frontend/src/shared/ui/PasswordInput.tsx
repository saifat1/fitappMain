import { useState } from "react";
import styles from "./PasswordInput.module.css";

type Props = {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export default function PasswordInput({
                                          id,
                                          name,
                                          value,
                                          onChange,
                                          placeholder,
                                          autoComplete,
                                          required,
                                          disabled,
                                          className = "",
                                      }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className={styles.root}>
            <input
                id={id}
                name={name}
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                disabled={disabled}
                className={`${styles.input} ${className}`.trim()}
            />

            <button
                type="button"
                className={styles.toggle}
                onClick={() => setIsVisible((prev) => !prev)}
                aria-label={isVisible ? "Скрыть пароль" : "Показать пароль"}
                title={isVisible ? "Скрыть пароль" : "Показать пароль"}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {!isVisible ? <path d="M4 4l16 16" /> : null}
                </svg>
            </button>
        </div>
    );
}