"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Group, ArrowRight, HelpCircle, CheckSquare, MessageSquare, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export default function AIAnalysisCenter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your LOOP AI customer assistant. Ask me questions like: 'Why are checkout users unhappy?' or select one of the suggested checklist items on the right.",
      time: "Just now",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Suggested Insights Checklist
  const suggestions = [
    {
      label: "Spike in checkout payment timeouts",
      prompt: "Explain why payment timeouts are spiking in checkout.",
      answer: "Payment timeouts spike due to Stripe webhook delays on Android systems. Recommended fix: Optimize API connection pooling in Neon adapters.",
    },
    {
      label: "Safari browser rendering latency",
      prompt: "Why are Safari browser users reporting dashboard lag?",
      answer: "Safari engine takes 15+ seconds compiling heavy PDF invoice data tables. Fix: Implement layout pagination to reduce heavy page loads.",
    },
    {
      label: "Support for regional currencies",
      prompt: "Are customers requesting regional currency supports?",
      answer: "Yes, 12 occurrences suggest adding Euro (€) and GBP (£) support to checkout widgets.",
    },
    {
      label: "Mobile UI drag-and-drop feedback",
      prompt: "What is the consensus on the new drag & drop builder UI?",
      answer: "94% positive sentiment! Customers love the design, but ask for dark-mode toggle options in sidebar preferences.",
    },
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Simulated AI response generation (OpenAI mock client endpoint connector ready)
  const generateAIResponse = async (userPrompt: string) => {
    setTyping(true);
    
    // Simulating OpenAI API latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let reply = "I've analyzed the feedback. We see strong POSITIVE feedback for the drag-and-drop builder, but minor latency in checkout Stripe forms. Would you like me to draft an executive weekly report?";
    
    const lower = userPrompt.toLowerCase();
    if (lower.includes("timeout") || lower.includes("checkout") || lower.includes("refund")) {
      reply = "Our billing models indicate 52% of checkout failures relate to transaction timeouts (failures exceeding 5 seconds), 24% mention Android Stripe failures (code 402), and 12% request local currency supports.";
    } else if (lower.includes("safari") || lower.includes("lag") || lower.includes("slow")) {
      reply = "Safari browser lags significantly when exporting weekly charts to PDF formats. The gateway times out after 15 seconds. We recommend lazy-loading chart graphics.";
    } else if (lower.includes("currency") || lower.includes("euro")) {
      reply = "Customers are requesting invoice support for Euros (€) and British Pounds (£) for regional checkout forms.";
    } else if (lower.includes("dark") || lower.includes("theme") || lower.includes("mode")) {
      reply = "Dark mode sidebar settings have contrast complaints. We should increase font contrast inside the settings stylesheet.";
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTyping(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || typing) return;

    const userMsg = inputVal.trim();
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputVal("");
    generateAIResponse(userMsg);
  };

  const handleSuggestedClick = (prompt: string, answer: string) => {
    if (typing) return;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: prompt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        role: "assistant",
        content: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-base font-bold text-slate-800">Ask LOOP AI Assistant</h4>
          <p className="text-xs text-slate-500">Query real-time feedback insights and check AI theme classifications.</p>
        </div>
      </div>

      {/* Main chat window - Two panes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch">
        
        {/* Left Column - Chat Dialogue (3/4 width) */}
        <div className="lg:col-span-3 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between h-[480px]">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-2xl">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-accent animate-pulse" /> Live Conversation history
            </span>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-white shadow-xs text-[10px] font-black ${
                    msg.role === "user"
                      ? "bg-slate-700"
                      : "bg-gradient-to-r from-brand-secondary to-brand-primary"
                  }`}
                >
                  {msg.role === "user" ? "U" : "AI"}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div
                    className={`text-xs px-4 py-2.5 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-none font-medium"
                        : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/60"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.time && (
                    <span className="text-[8px] text-slate-400 font-bold block px-1">
                      {msg.time}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-[10px] font-black">
                  AI
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-200/60">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prompt input at bottom */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={typing}
                placeholder="Ask LOOP AI anything about customer feedback..."
                className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-brand-primary/30 shadow-xs"
              />
              <button
                type="submit"
                disabled={typing || !inputVal.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Suggested Insights Checklist (1/4 width) */}
        <div className="lg:col-span-1 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-2 shrink-0">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-brand-primary" /> Suggested Insights
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Select checklist items to run AI audit summaries.</p>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                disabled={typing}
                onClick={() => handleSuggestedClick(item.prompt, item.answer)}
                className="w-full text-left p-3 rounded-xl border border-slate-200/60 bg-slate-50/40 hover:bg-slate-50 transition flex items-start gap-2.5 group text-xs disabled:opacity-50"
              >
                <div className="h-4 w-4 rounded border border-slate-350 bg-white group-hover:border-brand-primary flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <ArrowRight className="h-2.5 w-2.5 text-transparent group-hover:text-brand-accent transition-colors" />
                </div>
                <span className="font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl text-[9px] text-brand-accent leading-relaxed font-medium">
            <span className="font-bold flex items-center gap-1 mb-0.5">
              <Sparkles className="h-3 w-3" /> OpenAI API Hook Available
            </span>
            Customize mock query behaviors in `ai-analysis-center.tsx` to hook up live REST endpoints.
          </div>
        </div>

      </div>
    </div>
  );
}
