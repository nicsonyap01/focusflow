import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./firebase";
import { Timer } from "lucide-react";

export default function Login() {
  // ================================
  // GOOGLE LOGIN
  // ================================

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, provider);
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

  // ================================
  // FACEBOOK LOGIN
  // ================================

  async function handleFacebookLogin() {
    try {
      const provider =
        new FacebookAuthProvider();

      provider.setCustomParameters({
        display: "popup",
      });

      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(
        "Facebook sign-in error:",
        error
      );

      alert(
        `${error.code}\n\n${error.message}`
      );
    }
  }

  // ================================
  // LOGIN PAGE
  // ================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white">

      <div className="w-full max-w-md">

        {/* LOGO + TITLE */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
            <Timer size={27} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to FocusFlow
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Your personal study space.
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="rounded-3xl border border-white/[0.08] bg-[#111113] p-7 shadow-2xl">

          <div className="space-y-3">

            {/* GOOGLE BUTTON */}

            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200 active:scale-[0.99]"
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

            {/* FACEBOOK BUTTON */}

            <button
              onClick={handleFacebookLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#166FE5] active:scale-[0.99]"
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M24 12.07C24 5.42 18.63 0 12 0S0 5.42 0 12.07C0 18.1 4.39 23.08 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.72 4.58-4.72 1.33 0 2.72.24 2.72.24v3.01h-1.53c-1.51 0-1.98.94-1.98 1.9v2.23h3.37l-.54 3.49h-2.83V24C19.61 23.08 24 18.1 24 12.07z" />
              </svg>

              Continue with Facebook

            </button>

          </div>

          {/* DIVIDER */}

          <div className="my-6 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/[0.07]" />

            <span className="text-[10px] uppercase tracking-widest text-zinc-700">
              Secure sign in
            </span>

            <div className="h-px flex-1 bg-white/[0.07]" />

          </div>

          {/* DESCRIPTION */}

          <p className="text-center text-xs leading-5 text-zinc-600">
            Your tasks, study sessions,
            statistics and progress will
            be securely saved to your
            FocusFlow account.
          </p>

        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-[11px] text-zinc-700">
          By continuing, you agree to
          use FocusFlow responsibly.
        </p>

      </div>

    </div>
  );
}