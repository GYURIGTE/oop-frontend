import { Store } from "lucide-react";

type BaligyaLogoProps = {
  className?: string;
};

export default function BaligyaLogo({ className = "" }: BaligyaLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white">
        <Store size={14} strokeWidth={2.5} aria-hidden="true" />
      </div>

      <span className="text-[14px] font-bold tracking-tight text-black">
        BALIGYA
      </span>
    </div>
  );
}
