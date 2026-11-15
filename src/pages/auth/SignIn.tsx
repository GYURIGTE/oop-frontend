
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import marketPhoto from "@/assets/baligya-market-photo.png";
import BaligyaLogo from "@/components/brand/BaligyaLogo";
import PasswordField from "@/components/auth/PasswordField";
import { useAuth } from "@/context/useAuth";
import { ApiError } from "@/lib/api";

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Chrome ignores autoComplete="off" and injects saved credentials on load.
  // Keeping the fields read-only until the user interacts blocks that autofill.
  const [autofillGuard, setAutofillGuard] = useState(true);
  const unlockAutofill = () => setAutofillGuard(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(login, password);
      navigate("/seller/dashboard", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("email") ??
              caught.fieldError("password") ??
              caught.message)
          : "Could not sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">

      {/* LEFT PANEL */}
      <section className="relative hidden min-h-screen flex-col bg-[#F4F7F1] px-8 py-8 sm:px-12 lg:flex lg:px-16">

        {/* BALIGYA BRAND */}
        <BaligyaLogo size="lg" />

        {/* INTRODUCTION */}
        <div className="mx-auto mt-20 w-full max-w-[610px] lg:mt-[130px]">

          <h1 className="text-[32px] font-normal leading-[1.15] tracking-tight text-black sm:text-[42px]">
            Buy, Sell, and Connect.
          </h1>

          <p className="mt-4 max-w-[600px] text-[14px] leading-[1.7] text-[#4A4A4A]">
            Discover pre-loved items, list things you no longer need, and
            connect with people in your community. Make every item find a
            new home.
          </p>

          <img
            src={marketPhoto}
            alt="Two people exchanging an item at a local market"
            className="mt-8 aspect-[1.83/1] w-full object-cover"
          />

        </div>

        {/* BOTTOM TAGLINE */}
        <div className="mt-auto pt-12">
          <p className="text-[12px] text-black">
            <span className="font-bold">baligya</span> / to sell, to trade,
            to connect.
          </p>
        </div>

      </section>

      {/* RIGHT PANEL */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-6">

        <div className="w-full max-w-[432px]">

          {/* MOBILE BRAND */}
          <div className="mb-10 lg:hidden">
            <BaligyaLogo />
          </div>

          {/* SIGN IN CARD */}
          <div className="rounded-[10px] border border-[#E8ECE7] bg-white px-7 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.07)] sm:px-10">

            {/* CARD HEADING */}
            <div>
              <p className="text-[12px] font-bold tracking-[0.14em] text-black">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-[26px] font-medium leading-tight tracking-tight text-black">
                Your next find awaits.
              </h2>

              <p className="mt-2 text-[13px] text-[#929792]">
                Sign in to pick up where you left off.
              </p>
            </div>

            {/* SIGN IN FORM */}
            <form onSubmit={handleSubmit} className="mt-7" autoComplete="off">

              {/* USERNAME */}
              <div>
                <label
                  htmlFor="login"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Username
                </label>

                <input
                  id="login"
                  name="login"
                  type="text"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  onFocus={unlockAutofill}
                  onClick={unlockAutofill}
                  readOnly={autofillGuard}
                  placeholder="Enter your username"
                  autoComplete="off"
                  required
                  className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
                />
              </div>

              {/* PASSWORD */}
              <div className="mt-5">
                <PasswordField
                  id="password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  onFocus={unlockAutofill}
                  readOnly={autofillGuard}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
              </div>

              {/* FORGOT PASSWORD */}
              <div className="mt-3 flex justify-end">
                <Link
                  to="/auth/forgot-password"
                  className="text-[13px] font-semibold text-black transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                >
                  Forgot password?
                </Link>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-md border border-[#F3D3CE] bg-[#FDF2F1] px-3 py-2 text-[12px] text-[#B42318]"
                >
                  {error}
                </p>
              ) : null}

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 h-11 w-full rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

            </form>

            {/* CREATE ACCOUNT */}
            <p className="mt-7 text-center text-[13px] text-[#929792]">
              New to BALIGYA?{" "}
              <Link
                to="/auth/signup"
                className="ml-1 font-semibold text-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                Create an account
              </Link>
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
