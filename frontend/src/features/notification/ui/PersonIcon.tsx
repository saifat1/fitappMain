type Props = {
    className?: string;
};

export default function PersonIcon({ className }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.8" />
            <path d="M4.5 20c0-3.6 3.1-6 7.5-6s7.5 2.4 7.5 6" />
        </svg>
    );
}
