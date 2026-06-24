type Props = {
    initials: string;
    color: string;
    size?: "sm" | "md" | "lg";
    title?: string;
};

export default function Avatar({ initials, color, size = "sm", title }: Props) {
    return (
        <span
            className={`fb-avatar fb-avatar--${size}`}
            style={{ background: color }}
            title={title}
            aria-hidden={!title}
        >
            {initials}
        </span>
    );
}
