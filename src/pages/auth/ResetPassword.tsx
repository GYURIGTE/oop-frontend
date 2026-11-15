
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import PasswordField from "@/components/auth/PasswordField";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setError("");

    // We will connect this to the BALIGYA reset password API later.
    console.log({ password });

    // Send the user back to sign in once the password is updated.
    navigate("/auth/login");
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
              className="mt-5 h-11 w-full rounded-lg bg-black text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Reset Password
            </button>
          </form>
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
