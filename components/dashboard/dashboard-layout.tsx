"use client";

import React, { useState } from "react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans relative">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        workspaceName={user.workspaceName}
        userRole={user.role}
        className="hidden lg:flex"
      />

      {/* Mobile Sidebar Drawer Overlay */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sliding Panel */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            activeView={activeView}
            onViewChange={(view) => {
              onViewChange(view);
              setIsMobileSidebarOpen(false);
            }}
            workspaceName={user.workspaceName}
            userRole={user.role}
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Main View Grid */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeView={activeView}
          user={user}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Inner Content Slot */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="mx-auto max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
