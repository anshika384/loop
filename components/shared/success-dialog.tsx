"use client";

import { CheckCircle2, Clipboard, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  copyLabel?: string;
  openLabel?: string;
  toastTrigger: (msg: string) => void;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title,
  description,
  url,
  copyLabel = "Copy Link",
  openLabel = "Open Link",
  toastTrigger,
}: SuccessDialogProps) {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toastTrigger("Link copied successfully.");
    } catch (err) {
      console.error(err);
      toastTrigger("Failed to copy link.");
    }
  };

  const handleOpen = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Secure URL
            </p>
            <p className="text-xs text-slate-700 font-medium break-all select-all font-mono bg-white p-2 rounded-lg border border-slate-100">
              {url}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-55 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
            >
              <Clipboard className="h-3.5 w-3.5" />
              {copyLabel}
            </button>
            <button
              onClick={handleOpen}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {openLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
