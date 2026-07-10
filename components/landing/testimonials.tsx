"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "LOOP transformed how we do product planning. We consolidated 5 customer ticket channels into a single feed and identified our top 3 billing bugs within 10 minutes. It saves our PMs 15 hours a week.",
      author: "Sarah Jenkins",
      role: "VP of Product, CloudScale",
      rating: 5,
      avatarColor: "bg-blue-500",
      initials: "SJ",
    },
    {
      quote: "Before LOOP, we prioritised our roadmap based on whoever was the loudest customer in support. Now, we have exact quantitative counts of how many clients face a specific pain theme. It's a game-changer.",
      author: "Marcus Chen",
      role: "Head of Customer Success, DevFlow",
      rating: 5,
      avatarColor: "bg-purple-500",
      initials: "MC",
    },
    {
      quote: "The Ask LOOP AI feature is magic. I can search 'why are clients failing checkout?' and get a comprehensive analytical summary with linked ticket citations instantly. Highly recommend.",
      author: "Elena Rostova",
      role: "Founder & CEO, SaaSify",
      rating: 5,
      avatarColor: "bg-pink-500",
      initials: "ER",
    },
  ];

  return (
    <section id="testimonials" className="relative py-20 bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            Social Proof
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by Modern Product Teams
          </p>
          <p className="mt-4 text-base text-slate-650">
            Hear from product managers, founders, and customer success leaders who use LOOP to drive roadmap decisions.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div 
              key={idx}
              className="glass-panel glass-panel-hover bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative border border-slate-200 shadow-sm"
            >
              {/* Stars Row */}
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-accent text-brand-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                "{item.quote}"
              </p>

              {/* Author details */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                <div className={`h-9 w-9 rounded-full ${item.avatarColor} flex items-center justify-center text-white text-xs font-bold font-mono shadow-inner`}>
                  {item.initials}
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800">{item.author}</span>
                  <span className="block text-xs text-slate-500">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
