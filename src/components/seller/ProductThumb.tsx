type ProductThumbProps = {
  emoji: string;
  image?: string;
  alt?: string;
  tone?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
};

const sizeStyles = {
  sm: "h-11 w-11 text-xl",
  md: "h-14 w-14 text-2xl",
  lg: "h-36 w-full text-5xl",
  xl: "h-[180px] w-full text-6xl",
  hero: "h-[280px] w-full text-[90px] sm:h-[420px] sm:text-[120px]",
};

export default function ProductThumb({
  emoji,
  image,
  alt = "Product image",
  tone = "bg-[#F4F7F1]",
  size = "sm",
  className = "",
}: ProductThumbProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${tone} ${sizeStyles[size]} ${className}`}
      aria-hidden={image ? undefined : true}
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{emoji}</span>
      )}
    </div>
  );
}
