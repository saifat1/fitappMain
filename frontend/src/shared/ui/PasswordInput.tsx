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
                👁
            </button>
        </div>
    );
}