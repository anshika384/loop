"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../../lib/validation";
import { motion, AnimatePresence } from "framer-motion";
import SuccessDialog from "@/components/shared/success-dialog";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Success Dialog & Toast States
  const [resetDialogData, setResetDialogData] = useState<{ isOpen: boolean; title: string; description: string; url: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        setErrorMessage(resData.message || "Failed to submit request.");
        return;
      }

      if (resData.success && !resData.emailSent && resData.resetUrl) {
        setResetDialogData({
          isOpen: true,
          title: "Password Reset Link Generated",
          description: resData.emailError && resData.mode === "resend"
            ? `Email delivery failed: ${resData.emailError}.\n\nFalling back to development mode. Use the link below for testing.`
            : "Development Mode is enabled.\nEmail delivery is disabled.\nUse the secure password reset link below for testing.",
          url: resData.resetUrl,
        });
      } else {
        setSuccessMessage(
          resData.message || "If an account exists, a password reset link will be sent."
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

          {/* Premium Validation Banners */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium overflow-hidden"
              >
                {errorMessage}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium overflow-hidden"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                  className={`w-full rounded-xl border pl-12 pr-4 py-3 outline-none transition ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />
              </div>

              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                    id="email-error"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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

      <SuccessDialog
        isOpen={!!resetDialogData?.isOpen}
        onClose={() => setResetDialogData(null)}
        title={resetDialogData?.title || ""}
        description={resetDialogData?.description || ""}
        url={resetDialogData?.url || ""}
        copyLabel="Copy Reset Link"
        openLabel="Open Reset Page"
        toastTrigger={triggerToast}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}