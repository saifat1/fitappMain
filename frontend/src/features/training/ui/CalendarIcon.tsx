type Props = {
    className?: string;
};

export default function CalendarIcon({ className }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
    );
}
