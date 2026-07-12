"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../lib/validation";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      workspace: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        setErrorMessage(resData.message || "Registration failed.");
        return;
      }

      setSuccessMessage("Registration successful! Redirecting to login...");

      // Wait 2 seconds for visual feedback, then redirect to login page
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-6 relative">
      {/* Back Button */}
      <div className="w-full max-w-xl mx-auto mb-4 sm:mb-0 sm:absolute sm:top-6 sm:left-6 sm:w-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition text-sm sm:text-base"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="LOOP Logo"
            className="w-32 h-auto object-contain"
          />
        </div>

        {/* Register Card */}
        <div className="rounded-3xl bg-white shadow-2xl border border-blue-100 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Create Account
            </h1>

            <p className="text-slate-500 mt-2 text-sm">
              Join LOOP and start managing feedback smarter.
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

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-1">
              <label htmlFor="fullName" className="block mb-1.5 text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                {...register("fullName")}
                className={`w-full rounded-xl border px-4 py-2.5 outline-none transition text-sm ${
                  errors.fullName
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
              />

              <AnimatePresence>
                {errors.fullName && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                    id="fullName-error"
                  >
                    {errors.fullName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div className="sm:col-span-1">
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                className={`w-full rounded-xl border px-4 py-2.5 outline-none transition text-sm ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
              />

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

            {/* Password */}
            <div className="sm:col-span-1">
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  {...register("password")}
                  className={`w-full rounded-xl border px-4 py-2.5 pr-12 outline-none transition text-sm ${
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
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
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
            <div className="sm:col-span-1">
              <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-slate-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  {...register("confirmPassword")}
                  className={`w-full rounded-xl border px-4 py-2.5 pr-12 outline-none transition text-sm ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
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

            {/* Workspace */}
            <div className="sm:col-span-2">
              <label htmlFor="workspace" className="block mb-1.5 text-sm font-medium text-slate-700">
                Workspace / Company Name
              </label>

              <input
                id="workspace"
                type="text"
                placeholder="Enter workspace or company name"
                aria-invalid={errors.workspace ? "true" : "false"}
                aria-describedby={errors.workspace ? "workspace-error" : undefined}
                {...register("workspace")}
                className={`w-full rounded-xl border px-4 py-2.5 outline-none transition text-sm ${
                  errors.workspace
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
              />

              <AnimatePresence>
                {errors.workspace && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                    id="workspace-error"
                  >
                    {errors.workspace.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Register Button */}
            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
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