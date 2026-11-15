import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { ApiError, api } from "@/lib/api";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await api.auth.forgotPassword({ email: username.trim() });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
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
            Forgot your password?
          </h1>

          <p className="mt-3 text-[14px] text-[#929792]">
            Enter your username or email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Reset Password Card */}
        <section className="mt-8 rounded-[10px] border border-[#E8ECE7] bg-white px-7 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.07)] sm:px-10">

          {sent ? (
            <div>
              <p className="text-[14px] leading-relaxed text-black">
                If that account exists, a reset link is on its way to the email
                address registered to it.
              </p>

              <p className="mt-3 text-[13px] leading-relaxed text-[#929792]">
                The link expires in 60 minutes. Check your spam folder if you
                don&apos;t see it within a few minutes.
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

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Username or email
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  required
                  className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
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
                {submitting ? "Sending..." : "Send reset link"}
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
