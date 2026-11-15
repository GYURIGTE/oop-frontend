import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/25 motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-[520px] animate-[modal-in_180ms_ease-out] rounded-xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="dialog-title"
              className="text-[18px] font-semibold leading-tight text-black"
            >
              {title}
            </h2>

            {description ? (
              <p className="mt-2 text-[13px] leading-relaxed text-[#6B726B]">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-[#8A9089] transition hover:bg-[#F4F7F1] hover:text-black"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        {footer ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
