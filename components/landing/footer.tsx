"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "AI Classification", href: "#features-grid" },
        { name: "Theme Clustering", href: "#features-grid" },
        { name: "Pricing", href: "#pricing" },
        { name: "Changelog", href: "#changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Security Spec", href: "#benefits" },
        { name: "Data Privacy", href: "#faq" },
        { name: "Contact Sales", href: "#demo" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "Help Center", href: "#help" },
        { name: "API Status", href: "#status" },
        { name: "Community Forum", href: "#forum" },
      ],
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 md:py-20 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 md:gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Logo & Pitch column */}
          <div className="lg:col-span-3 space-y-6 max-w-md">
            <div className="flex items-center gap-2">
              <div className="relative w-[230px] h-[80px] flex items-center">
                <Image
                  src="/logo.png"
                  alt="LOOP Logo"
                  width={210}
                  height={70}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Turn scattered customer feedback into ranked, evidence-backed product decisions. Automatically ingest, tag, and cluster user complaints from multiple support and survey channels.
            </p>
            
            {/* Newsletter form */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-200">Subscribe to our newsletter</span>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-sm gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full sm:flex-1 rounded-full border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-200 transition active:scale-[0.97]"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-brand-accent font-semibold pt-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SOC-2 Type II Certified</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          {footerLinks.map((col, idx) => (
            <div key={idx} className="space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                {col.title}
              </span>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link, lidx) => (
                  <li key={lidx}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom copyright and legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} LOOP Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-slate-350 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-350 hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-350 hover:text-slate-300 transition-colors">Cookies Policy</a>
          </div>
          
          {/* Social Icons (using inline SVGs for compatibility) */}
          <div className="flex gap-4 items-center">
            {/* Twitter / X */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" title="Twitter / X">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* GitHub */}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" title="GitHub">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" title="LinkedIn">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            <span>for Product Teams</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
