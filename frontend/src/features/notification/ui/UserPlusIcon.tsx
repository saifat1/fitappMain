type Props = {
    className?: string;
};

export default function UserPlusIcon({ className }: Props) {
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
            <circle cx="9" cy="8" r="3.5" />
            <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
            <path d="M18 8v5M15.5 10.5h5" />
        </svg>
    );
}
