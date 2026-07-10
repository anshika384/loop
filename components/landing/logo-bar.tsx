"use client";

import { motion } from "framer-motion";

export default function LogoBar() {
  const logos = [
    {
      name: "Microsoft",
      svg: (
        <svg viewBox="0 0 23 23" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022" />
          <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00" />
          <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef" />
          <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900" />
        </svg>
      ),
      textClass: "text-slate-700 font-bold tracking-tight text-sm md:text-base",
    },
    {
      name: "Stripe",
      svg: (
        <svg viewBox="0 0 24 24" className="h-6.5 w-6.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.93 4.5c0-1.8 1.4-2.8 3.8-2.8 1.3 0 2.4.3 3.3.7v3.9c-.8-.3-2-.5-3.1-.5-1.5 0-2.3.7-2.3 1.7 0 2.4 8.7 2 8.7 7.4 0 5.1-3.1 7.2-7.8 7.2-1.5 0-2.9-.3-3.8-.7v-4.1c1 .4 2.5.7 3.8.7 1.9 0 2.9-.8 2.9-1.9.1-2.7-8.7-2.2-8.7-7.4z" fill="#635bff"/>
        </svg>
      ),
      textClass: "text-slate-700 font-extrabold tracking-tight text-sm md:text-base lowercase",
    },
    {
      name: "Slack",
      svg: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
          {/* Blue loop top left */}
          <path d="M5 9.5a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 5 3.5a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 5 9.5z" fill="#36c5f0"/>
          <circle cx="8" cy="8" r="1.5" fill="#36c5f0"/>
          {/* Green loop top right */}
          <path d="M14.5 5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 20.5 5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 14.5 5z" fill="#2eb67d"/>
          <circle cx="16" cy="8" r="1.5" fill="#2eb67d"/>
          {/* Red/Pink loop bottom right */}
          <path d="M19 14.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5z" fill="#e01e5a"/>
          <circle cx="16" cy="16" r="1.5" fill="#e01e5a"/>
          {/* Yellow loop bottom left */}
          <path d="M9.5 19a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 3.5 19a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5z" fill="#ecb22e"/>
          <circle cx="8" cy="16" r="1.5" fill="#ecb22e"/>
        </svg>
      ),
      textClass: "text-slate-700 font-extrabold tracking-tight text-sm md:text-base lowercase",
    },
    {
      name: "Atlassian",
      svg: (
        <svg viewBox="0 0 24 24" className="h-6.5 w-6.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.66 2.35a.8.8 0 0 1 1.34 0l8.77 14.5a.8.8 0 0 1-.68 1.21h-4.47a.8.8 0 0 0-.68.38l-2.61 4.31a.8.8 0 0 1-1.37 0l-2.61-4.31a.8.8 0 0 0-.68-.38H4.25a.8.8 0 0 1-.68-1.21z" fill="#0052cc"/>
        </svg>
      ),
      textClass: "text-slate-700 font-bold tracking-normal text-sm md:text-base",
    },
    {
      name: "Shopify",
      svg: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a4 4 0 0 0-4 4v1h8V6a4 4 0 0 0-4-4z" fill="none" stroke="#95bf47" strokeWidth="2.5"/>
          <path d="M5 7l1.5 14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2L19 7H5z" fill="#95bf47"/>
          <path d="M11.5 10a2.5 2.5 0 0 1 2.5 2.5v1.5c-1 0-2.5-1.5-2.5-4z" fill="#5e8e3e"/>
        </svg>
      ),
      textClass: "text-slate-700 font-extrabold tracking-tight text-sm md:text-base lowercase",
    },
    {
      name: "HubSpot",
      svg: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="6" stroke="#ff7a59" strokeWidth="3" fill="none" />
          <line x1="12" y1="6" x2="12" y2="1" stroke="#ff7a59" strokeWidth="3" />
          <circle cx="12" cy="1" r="2.5" fill="#ff7a59" />
          <line x1="17.2" y1="17.2" x2="20.7" y2="20.7" stroke="#ff7a59" strokeWidth="3" />
          <circle cx="20.7" cy="20.7" r="2.5" fill="#ff7a59" />
        </svg>
      ),
      textClass: "text-slate-700 font-bold tracking-tight text-sm md:text-base",
    },
  ];

  return (
    <section className="relative py-14 bg-slate-50/40 border-b border-slate-100 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Caption */}
        <p className="text-center text-xs md:text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-10">
          Trusted by Product Teams Worldwide
        </p>

        {/* Logos Flexbox wrapper */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -3, scale: 1.03 }}
              className="flex items-center gap-3.5 px-6 py-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_3px_12px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-default"
              title={logo.name}
            >
              {logo.svg}
              <span className={logo.textClass}>{logo.name}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
