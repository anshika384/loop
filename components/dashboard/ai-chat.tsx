"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Send } from "lucide-react";

export default function AIChat() {
  const [typedPrompt, setTypedPrompt] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const handlePromptClick = (prompt: string, answer: string) => {
    setChatAnswer(null);
    setTypedPrompt("");
    setTyping(true);
    
    // Keyboard typing simulation
    let charIdx = 0;
    const interval = setInterval(() => {
      setTypedPrompt((prev) => prev + prompt.charAt(charIdx));
      charIdx++;
      if (charIdx >= prompt.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTyping(false);
          setChatAnswer(answer);
        }, 800);
      }
    }, 30);
  };

  return (
    <div className="space-y-4 flex flex-col justify-between h-[420px]">
      <div className="border-b border-slate-100 pb-3 flex-shrink-0">
        <h4 className="text-base font-bold text-slate-800">Ask LOOP AI Assistant</h4>
        <p className="text-xs text-slate-500">Run search prompts against the indexed database of customer comments.</p>
      </div>

      {/* Chat Logs Output Pane */}
      <div className="flex-1 overflow-y-auto space-y-3.5 min-h-[220px] pr-2 scrollbar-thin">
        {typedPrompt ? (
          <div className="space-y-3.5">
            <div className="flex gap-2 items-start justify-end">
              <div className="bg-slate-100 text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] font-medium">
                {typedPrompt}
              </div>
            </div>
            
            {/* Simulated typing dot-loader */}
            {typing && (
              <div className="flex gap-2 items-start">
                <div className="p-2.5 bg-brand-primary/5 rounded-2xl rounded-tl-none border border-brand-primary/10">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {chatAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex gap-2.5 items-start"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-brand-primary/5 text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tl-none border border-brand-primary/10 max-w-[85%] leading-relaxed">
                  {chatAnswer}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-400">
            <MessageSquare className="h-8 w-8 text-slate-300 animate-pulse" />
            <p className="text-xs text-slate-400">Click one of the suggestions below to query the database.</p>
          </div>
        )}
      </div>

      {/* Pre-made suggestions and input box */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePromptClick(
              "Why are checkout users requesting refunds?",
              "Refund audits show: 52% mention transaction latency (timeouts over 5 seconds). 24% complain about Stripe payment failure codes, and 12% request local currency supports."
            )}
            className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 transition"
          >
            "Checkout Refund Reasons?"
          </button>
          <button
            type="button"
            onClick={() => handlePromptClick(
              "Summarize top mobile feedback complaints",
              "Analyzing 420 reviews: Users complain about Safari navigation bugs (24 occurrences), lack of a dark-mode toggle (18 occurrences), and slow image loading (15 occurrences)."
            )}
            className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 transition"
          >
            "Summarize mobile feedback"
          </button>
        </div>

        {/* Mock Input field */}
        <div className="relative">
          <input
            type="text"
            readOnly
            placeholder="Type or click query suggestion..."
            value={typedPrompt}
            className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl pl-4 pr-10 py-3.5 focus:outline-none placeholder-slate-400"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
