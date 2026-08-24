import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./firebase";

import { Timer } from "lucide-react";

export default function Login() {
  async function handleGoogleLogin() {
    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(
        auth,
        provider
      );
    } catch (error) {
      console.error(
        "Google sign-in error:",
        error
      );

      alert(
        `${error.code}\n\n${error.message}`
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Timer size={27} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to FocusFlow
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Your personal study space.
          </p>

        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#111113] p-7">

          <button
            onClick={
              handleGoogleLogin
            }
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.92v2.42h3.14c1.84-1.69 2.93-4.18 2.93-7.37z"
              />

              <path
                fill="#34A853"
                d="M12 21.67c2.63 0 4.84-.87 6.45-2.37l-3.14-2.42c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.67z"
              />

              <path
                fill="#FBBC05"
                d="M6.54 13.77A5.84 5.84 0 0 1 6.23 12c0-.61.11-1.21.31-1.77v-2.5H3.3A9.74 9.74 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.27l3.24-2.5z"
              />

              <path
                fill="#EA4335"
                d="M12 6.2c1.43 0 2.72.49 3.74 1.45l2.8-2.8C16.83 3.29 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.4l3.24 2.5C7.31 7.92 9.46 6.2 12 6.2z"
              />
            </svg>

            Continue with Google

          </button>

          <p className="mt-5 text-center text-xs leading-5 text-zinc-600">
            Your tasks, sessions and
            progress will be saved to
            your account.
          </p>

        </div>

      </div>

    </div>
  );
}