
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import PasswordField from "@/components/auth/PasswordField";
import { useAuth } from "@/context/useAuth";
import { ApiError } from "@/lib/api";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const { firstName, lastName } = splitName(fullName);

    if (!firstName || !lastName) {
      setError("Enter your first and last name.");
      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        username: username.trim(),
        password,
        password_confirmation: password,
      });

      navigate("/seller/dashboard", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("email") ??
              caught.fieldError("username") ??
              caught.fieldError("password") ??
              caught.message)
          : "Could not create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-5 py-10">
      <section className="w-full max-w-[432px] rounded-[10px] border border-[#E8ECE7] bg-white px-7 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.07)] sm:px-10">

        {/* Heading */}
        <div>
          <h1 className="text-[26px] font-medium leading-tight tracking-tight text-black">
            Join the good finds.
          </h1>

          <p className="mt-2 text-[13px] text-[#929792]">
            Create an account. Make room for possibilities.
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="mt-7">

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-[13px] font-medium text-black"
            >
              Full name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your first and last name"
              autoComplete="name"
              required
              className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Email */}
          <div className="mt-5">
            <label
              htmlFor="email"
              className="mb-2 block text-[13px] font-medium text-black"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Username */}
          <div className="mt-5">
            <label
              htmlFor="username"
              className="mb-2 block text-[13px] font-medium text-black"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Password */}
          <div className="mt-5">
            <PasswordField
              id="password"
              name="password"
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              helperText="Use at least 8 characters, including a number."
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[#F3D3CE] bg-[#FDF2F1] px-3 py-2 text-[12px] text-[#B42318]"
            >
              {error}
            </p>
          ) : null}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-11 w-full rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="mt-7 text-center text-[13px] text-[#929792]">
          Already part of the community?{" "}
          <Link
            to="/auth/login"
            className="ml-1 font-semibold text-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
