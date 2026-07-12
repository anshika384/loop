"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../lib/validation";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Verify token on page load
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setIsValidToken(false);
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/reset-password?token=${token}`);
        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setIsValidToken(false);
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!token) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setErrorMessage(resData.message || "Failed to reset password.");
        return;
      }

      setSuccessMessage("Password reset successful! Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error("Reset submit error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // State A: Loading Verification Screen
  if (verifying) {
    return (
      <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Verifying reset link...</h2>
        <p className="text-slate-500 mt-2 text-sm">Please wait while we validate your token.</p>
      </div>
    );
  }

  // State B: Invalid / Expired Link Screen
  if (!isValidToken) {
    return (
      <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-50 rounded-full border border-red-100 text-red-500">
            <AlertCircle size={40} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Link Invalid or Expired</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          The password reset link is invalid, expired, or has already been used. Please request a new link to proceed.
        </p>

        <div className="space-y-4">
          <Link
            href="/forgot-password"
            className="block w-full text-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition text-sm"
          >
            Request New Link
          </Link>

          <Link
            href="/login"
            className="block text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // State C: Render Form to Reset Password
  return (
    <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Reset Password</h1>
        <p className="text-slate-500 mt-3">Choose a new secure password for your LOOP account.</p>
      </div>

      {/* Premium Validation Banners */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium overflow-hidden flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium overflow-hidden flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block mb-2 font-medium text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
              className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                id="password-error"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block mb-2 font-medium text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              {...register("confirmPassword")}
              className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                id="confirmPassword-error"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Password Button */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 py-10 relative">
      {/* Back Button */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-0 sm:absolute sm:top-8 sm:left-8 sm:w-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="LOOP Logo" className="w-40 h-auto object-contain" />
        </div>

        {/* Form Container with Suspense to hold useSearchParams hook */}
        <Suspense
          fallback={
            <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-slate-800">Loading Page...</h2>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
