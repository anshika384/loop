"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // State flags
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<"invalid" | "expired" | "accepted" | "unknown" | null>(null);
  const [inviteData, setInviteData] = useState<{
    name: string;
    email: string;
    role: string;
    workspaceName: string;
  } | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorState("invalid");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/invite/accept?token=${token}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setInviteData(json.data);
          setFullName(json.data.name);
        } else {
          const msg = json.message || "";
          if (msg.includes("expired")) {
            setErrorState("expired");
          } else if (msg.includes("already")) {
            setErrorState("accepted");
          } else {
            setErrorState("invalid");
          }
        }
      } catch (err) {
        console.error(err);
        setErrorState("unknown");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: fullName.trim(),
          password,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage("Invitation accepted! Redirecting to workspace...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setErrorMessage(json.message || "Failed to accept invitation.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Connection error while completing registration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center space-y-3 py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-bold text-slate-500">Validating secure invitation token...</p>
      </div>
    );
  }

  // Error States
  if (errorState === "invalid") {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Invalid Invitation</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            This invitation token is invalid or does not exist. Please contact your workspace administrator.
          </p>
        </div>
        <Link href="/login" className="inline-block text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-850 transition">
          Return to Login
        </Link>
      </div>
    );
  }

  if (errorState === "expired") {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Expired Invitation</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            This invitation has expired (invites are valid for 7 days). Please request a new invite from your workspace administrator.
          </p>
        </div>
        <Link href="/login" className="inline-block text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-850 transition">
          Return to Login
        </Link>
      </div>
    );
  }

  if (errorState === "accepted") {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Already Joined</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            This invitation has already been accepted. You can log in directly to your workspace.
          </p>
        </div>
        <Link href="/login" className="inline-block text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-850 transition">
          Log In Now
        </Link>
      </div>
    );
  }

  if (errorState === "unknown") {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-650 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Validation Failed</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            An unexpected error occurred while validating the invitation. Please try again.
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Join Workspace</h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
          You have been invited to join <strong>{inviteData?.workspaceName}</strong> as a <strong>{inviteData?.role}</strong>.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold"
          >
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-xs font-semibold"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
          <input
            type="text"
            disabled
            value={inviteData?.email}
            className="w-full text-xs border border-slate-200 bg-slate-100 text-slate-500 rounded-xl px-3 py-2.5 select-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="SARAH JENKINS"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Set Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Create password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-750"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !fullName.trim() || !password || !confirmPassword}
          className="w-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl shadow-lg disabled:opacity-50 transition active:scale-[0.99] cursor-pointer"
        >
          {submitting ? "Joining Workspace..." : "Complete Signup & Join"}
        </button>
      </form>
    </div>
  );
}

export default function InvitePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white border border-blue-100 p-8 rounded-3xl shadow-2xl relative">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="LOOP Logo" className="w-28 h-auto object-contain" />
        </div>
        <Suspense fallback={
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-bold text-slate-500 mt-3">Loading page content...</p>
          </div>
        }>
          <InviteContent />
        </Suspense>
      </div>
    </main>
  );
}
