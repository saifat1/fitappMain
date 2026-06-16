type Props = {
    className?: string;
    /** Color of the lettering. White on splash, brand green elsewhere. */
    color?: string;
};

/**
 * FitApp wordmark used on the splash / onboarding screen.
 * Swap for an <img src="/fitapp-wordmark.svg" /> once a final logo is exported.
 */
export default function BrandWordmark({ className, color = "#ffffff" }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 360 96"
            role="img"
            aria-label="FitApp"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <text
                x="50%"
                y="50%"
                dominantBaseline="central"
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontSize="62"
                fontWeight="800"
                letterSpacing="1"
                fill={color}
            >
                FitApp
            </text>
        </svg>
    );
}
