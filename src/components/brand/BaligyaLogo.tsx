import { Store } from "lucide-react";

type BaligyaLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    box: "h-6 w-6 rounded-md",
    icon: 12,
    text: "text-[12px]",
  },
  md: {
    box: "h-7 w-7 rounded-md",
    icon: 14,
    text: "text-[14px]",
  },
  lg: {
    box: "h-11 w-11 rounded-lg",
    icon: 22,
    text: "text-[24px]",
  },
} as const;

export default function BaligyaLogo({
  className = "",
  size = "md",
}: BaligyaLogoProps) {
  const style = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center bg-black text-white ${style.box}`}
      >
        <Store size={style.icon} strokeWidth={2.5} aria-hidden="true" />
      </div>

      <span
        className={`font-bold tracking-tight text-black ${style.text}`}
      >
        BALIGYA
      </span>
    </div>
  );
}
