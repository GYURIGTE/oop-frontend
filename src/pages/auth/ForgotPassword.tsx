
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // We will connect this to the BALIGYA password reset API later.
    console.log({ username });

    // Continue to the reset password step.
    navigate("/auth/reset-password", { state: { username } });
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
            Enter your username to start resetting your password.
          </p>
        </div>

        {/* Reset Password Card */}
        <section className="mt-8 rounded-[10px] border border-[#E8ECE7] bg-white px-7 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.07)] sm:px-10">

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div>
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
