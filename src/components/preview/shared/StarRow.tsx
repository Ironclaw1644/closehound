import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";

export function StarRow({
  rating,
  size = "sm",
  className = "",
}: {
  rating: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const sizeClass =
    size === "xs" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <FontAwesomeIcon key={`f-${i}`} icon={faStar} className={sizeClass} />
      ))}
      {half ? <FontAwesomeIcon icon={faStarHalfStroke} className={sizeClass} /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <FontAwesomeIcon
          key={`e-${i}`}
          icon={faStar}
          className={`${sizeClass} opacity-25`}
        />
      ))}
    </span>
  );
}
