import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  helperText?: string;
  readOnly?: boolean;
  onFocus?: () => void;
};

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  minLength,
  helperText,
  readOnly = false,
  onFocus,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-medium text-black"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          readOnly={readOnly}
          onFocus={onFocus}
          required
          className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 pr-11 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
        />

        <button
          type="button"
          onClick={() => setShowPassword((previous) => !previous)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-[#8A9089] transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          {showPassword ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {helperText ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[#929792]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
