"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6 py-10">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Loop Logo"
            className="w-40 h-auto object-contain"
          />
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="text-slate-500 mt-3">
              Login to continue using LOOP
            </p>
          </div>

          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember Me
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Login
            </button>
          </form>

          {/* Register */}
          <div className="mt-8 text-center text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}