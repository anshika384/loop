  "use client";

  import { useState, useEffect } from "react";
  import Image from "next/image";
  import Link from "next/link";
  import { motion, AnimatePresence } from "framer-motion";
  import { Menu, X, ArrowRight } from "lucide-react";
  import { Variants } from "framer-motion";


  export default function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Intersection Observer to highlight active section on scroll
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { threshold: 0.25, rootMargin: "-80px 0px -40% 0px" }
      );

      const sections = ["features", "ai-engine", "analytics", "benefits", "pricing", "faq"];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => {
        sections.forEach((id) => {
          const el = document.getElementById(id);
          if (el) observer.unobserve(el);
        });
      };
    }, []);

    const navLinks = [
      { name: "Features", href: "#features" },
      { name: "AI Engine", href: "#ai-engine" },
      { name: "Analytics", href: "#analytics" },
      { name: "Benefits", href: "#benefits" },
      { name: "Pricing", href: "#pricing" },
      { name: "FAQ", href: "#faq" },
    ];

    return (
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 py-3 md:py-5 ${
          scrolled
            ? "border-b border-blue-100 bg-blue-50/80 backdrop-blur-md shadow-[0_4px_20px_rgba(48,112,240,0.03)] py-2 md:py-3"
            : "border-b border-transparent bg-blue-50/20"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 p-1">
                <div className="relative w-[250px] h-[90px] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="LOOP Logo"
                    width={240}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2 relative">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative px-4 py-2 text-base font-semibold transition-colors duration-250 cursor-pointer ${
                    activeSection === link.href.substring(1) 
                      ? "text-brand-secondary font-bold" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {/* Active/Hover Sliding Pill background */}
                  {hoveredLink === link.href && (
                    <motion.span
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full bg-blue-100/40 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {activeSection === link.href.substring(1) && hoveredLink !== link.href && (
                    <motion.span
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full bg-brand-secondary/10 border border-brand-secondary/15 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Action CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 text-base font-bold text-slate-700 hover:text-brand-secondary rounded-full border border-blue-200 bg-white/70 hover:bg-blue-50/80 hover:border-blue-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/45 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}  
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2.5 text-slate-500 hover:bg-blue-100/50 hover:text-slate-800 focus:outline-none transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-blue-100 bg-blue-50/95 backdrop-blur-lg px-6 pt-4 pb-8 space-y-4 overflow-hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                    activeSection === link.href.substring(1)
                      ? "bg-brand-secondary/15 text-brand-secondary font-bold"
                      : "text-slate-655 hover:bg-blue-100/50 hover:text-slate-900 text-slate-600"
                  }`}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-blue-100 my-4" />
              <div className="flex flex-col gap-3">
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/login"
                  className="text-center text-base font-bold text-slate-700 hover:text-brand-secondary py-3 rounded-xl bg-white/70 border border-blue-200"
                >
                  Login
                </Link>
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-secondary to-brand-primary py-3.5 text-base font-bold text-white shadow-md shadow-brand-primary/10"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }
