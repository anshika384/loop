"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does LOOP's AI classification model work?",
      answer: "LOOP uses advanced Large Language Model (LLM) pipelines combined with proprietary semantic search algorithms. When a feedback item is ingested, the engine cleans the text, detects the sentiment, maps it to custom category schemas (with confidence percentages), and clusters similar issues into central themes, all in under 500 milliseconds.",
    },
    {
      question: "How is my customer data secured?",
      answer: "We take enterprise security seriously. All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We support SOC-2 compliant data isolation protocols and offer granular role-based permissions (RBAC) so you control exactly who can view or analyze customer feedback records.",
    },
    {
      question: "Can we track sentiment trends over time?",
      answer: "Yes. The Sentiment Analytics dashboard plots weekly, monthly, and quarterly sentiment index score distributions. LOOP automatically alerts product and support teams when negative sentiment spikes around a specific theme, allowing you to catch regressions early.",
    },
    {
      question: "Does LOOP use my customer feedback to train public models?",
      answer: "Absolutely not. Your feedback database is isolated, private, and secure. We do not use customer feedback data to train public, shared LLM models. All AI analysis is executed within dedicated instances that comply with strict GDPR and HIPAA data-privacy standards.",
    },
    {
      question: "Do you offer a free plan and what are the limits?",
      answer: "Yes, our Start Free plan allows up to 250 feedback records processed per month across 2 integration sources. It includes basic AI classification and sentiment detection. Our scale and enterprise plans offer unlimited integrations, higher volume, custom schemas, and role permissions.",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 bg-white">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            Got Questions?
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="mt-4 text-base text-slate-600">
            Everything you need to know about the LOOP feedback intelligence platform, AI processing, and enterprise pricing.
          </p>
        </motion.div>

        {/* Collapsible Accordion Wrapper */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-slate-800 focus:outline-none"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base">
                    <HelpCircle className="h-5 w-5 text-brand-accent flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 text-slate-550 transition-transform duration-300 ${
                      isOpen ? "transform rotate-180 text-brand-accent" : ""
                    }`} 
                  />
                </button>
                
                {/* Collapsible Answer Body with AnimatePresence */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-slate-200"
                    >
                      <p className="px-6 py-5 text-sm text-slate-650 leading-relaxed bg-white">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
