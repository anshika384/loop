"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      // Backend will be integrated later
      console.log(email);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        "If an account exists, a password reset link will be sent."
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6 py-10">

      {/* Back Button */}

      <div className="absolute top-8 left-8">
        <Link
          href="/login"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="LOOP Logo"
            className="w-40 h-auto object-contain"
          />
        </div>

        {/* Card */}

        <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8">

          <div className="text-center mb-8">

            <h1 className="text-4xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="text-slate-500 mt-3">
              Enter your email and we'll send you a password reset link.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>

              <label className="block mb-2 font-medium text-slate-700">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

          <div className="mt-8 text-center text-slate-600">

            Remember your password?{" "}

            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}