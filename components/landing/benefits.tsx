"use client";

import { motion } from "framer-motion";
import { Compass, Clock, Activity, HeartHandshake, Lock, UserCheck, LayoutGrid } from "lucide-react";

export default function Benefits() {
  const coreBenefits = [
    {
      title: "Evidence-Backed Decisions",
      description: "Stop guessing what to build next. Base roadmap decisions on hard quantitative counts of customer requests and bug spikes.",
      icon: Compass,
    },
    {
      title: "Save Hundreds of Hours",
      description: "Automate the manual process of reading, tagging, and compiling reports from disjointed channels. Let AI do the heavy lifting.",
      icon: Clock,
    },
    {
      title: "Detect Customer Issues Early",
      description: "Catch critical regressions or breaking UI bugs in minutes rather than days. Reduce churn by fixing issues before users write support tickets.",
      icon: Activity,
    },
    {
      title: "Improve Customer Satisfaction",
      description: "Build exactly what users are asking for and close the feedback loop, showing your clients that their inputs directly shape the product.",
      icon: HeartHandshake,
    },
  ];

  const enterpriseSpecs = [
    {
      title: "Enterprise Grade Security",
      description: "Encryption in transit and at rest. SOC-2 compliant policies and data isolation structures keep customer data secure.",
      icon: Lock,
    },
    {
      title: "Role-Based Access Control",
      description: "Configure custom permissions. Set up administrators, analysts, and view-only accounts to match your corporate structure.",
      icon: UserCheck,
    },
    {
      title: "Multi-Workspace Support",
      description: "Organize feedback streams by product lines, regions, or internal divisions with distinct workspaces and separate billing.",
      icon: LayoutGrid,
    },
  ];

  return (
    <section id="benefits" className="relative py-20 md:py-28 bg-white">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            Why Choose LOOP
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Built for Product & Engineering Teams
          </p>
          <p className="mt-4 text-base text-slate-650">
            Unify customer feedback processing and empower your team to build high-impact roadmaps based on objective customer evidence.
          </p>
        </div>

        {/* Benefits Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Business Benefits */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Platform Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {coreBenefits.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="inline-flex p-2.5 rounded-lg bg-brand-primary/10 text-brand-accent border border-brand-primary/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Enterprise Capabilities Card */}
          <div className="lg:col-span-5">
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-brand-secondary/10 to-brand-primary/10 border border-slate-200 shadow-sm">
              <div className="bg-white rounded-[14px] p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-accent" />
                  Enterprise Trust
                </h3>
                
                <div className="space-y-6">
                  {enterpriseSpecs.map((spec, idx) => {
                    const Icon = spec.icon;
                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-800">
                            {spec.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {spec.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Need HIPAA, GDPR compliance or SSO?{" "}
                    <a href="#demo" className="text-brand-accent hover:underline">
                      Contact Sales
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
