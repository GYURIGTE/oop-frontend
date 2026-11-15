import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import PasswordField from "@/components/auth/PasswordField";
import { ApiError, api } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const linkInvalid = !token || !email;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.auth.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.fieldError("email") ?? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-[432px]">

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-[30px] font-normal leading-tight tracking-tight text-black sm:text-[34px]">
            Reset Password
          </h1>

          <p className="mt-3 text-[14px] text-[#929792]">
            Create a new password for your BALIGYA account.
          </p>
        </div>

        {/* Reset Password Card */}
        <section className="mt-8 rounded-[10px] border border-[#E8ECE7] bg-white px-7 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.07)] sm:px-10">

          {linkInvalid ? (
            <div>
              <p role="alert" className="text-[14px] leading-relaxed text-[#B42318]">
                This reset link is invalid or incomplete. Please request a new
                one.
              </p>

              <Link
                to="/auth/forgot-password"
                className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div>
              <p className="text-[14px] leading-relaxed text-black">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>

              <Link
                to="/auth/login"
                className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* New Password */}
              <PasswordField
                id="newPassword"
                name="newPassword"
                label="New Password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
              />

              {/* Confirm New Password */}
              <div className="mt-5">
                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              {error ? (
                <p role="alert" className="mt-3 text-[13px] text-[#B42318]">
                  {error}
                </p>
              ) : null}

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 h-11 w-full rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </section>

        {/* Back to Sign In */}
        <p className="mt-7 text-center text-[13px] text-[#929792]">
          <Link
            to="/auth/login"
            className="font-semibold text-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Back to sign in
          </Link>
        </p>

      </div>
    </main>
  );
}
