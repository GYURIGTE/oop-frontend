import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#929792]">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-1.5 text-[30px] font-normal leading-tight tracking-tight text-black sm:text-[34px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-1.5 max-w-[560px] text-[14px] leading-relaxed text-[#6B726B]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
