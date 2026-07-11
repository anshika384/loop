"use client";

import React from "react";
import Sidebar from "./sidebar";
import TopNavbar from "./top-navbar";

interface DashboardLayoutProps {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
    workspaceName: string;
  };
  activeView: string;
  onViewChange: (view: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  user,
  activeView,
  onViewChange,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        workspaceName={user.workspaceName}
      />

      {/* Main View Grid */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar activeView={activeView} user={user} />

        {/* Inner Content Slot */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="mx-auto max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
