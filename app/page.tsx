import Navigation from "@/components/landing/navigation";
import Hero from "@/components/landing/hero";
import LogoBar from "@/components/landing/logo-bar";
import Problem from "@/components/landing/problem";
import HowItWorks from "@/components/landing/how-it-works";
import Features from "@/components/landing/features";
import DashboardPreview from "@/components/landing/dashboard-preview";
import Benefits from "@/components/landing/benefits";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <LogoBar />
        <Problem />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <Benefits />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
