type Props = {
    className?: string;
};

export default function CancelCrossIcon({ className }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}
