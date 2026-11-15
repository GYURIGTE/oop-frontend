import type { ListingStatus } from "@/data/seller";

type StatusBadgeProps = {
  status: ListingStatus;
  className?: string;
};

const statusStyles: Record<ListingStatus, string> = {
  Active: "bg-[#E9F0E4] text-[#3F6B3F]",
  Sold: "bg-[#EEF0EE] text-[#6B726B]",
  Draft: "bg-[#F5F0E4] text-[#8A6D1F]",
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
