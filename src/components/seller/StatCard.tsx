type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-[10px] border border-[#E8ECE7] bg-white p-5">
      <p className="text-[14px] text-[#6B726B]">{label}</p>
      <p className="mt-3 text-[28px] font-medium leading-none tracking-tight text-black">
        {value}
      </p>
      <p className="mt-4 text-[13px] text-[#929792]">{hint}</p>
    </div>
  );
}
