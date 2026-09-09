"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SettingsModal from "./SettingsModal";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer or settings modal is open
  useEffect(() => {
    if (mobileDrawerOpen || settingsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen, settingsOpen]);

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-slate-800 antialiased">
      {/* Desktop Fixed Left Sidebar (w-60 / 230px) */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen z-30">
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Drawer Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar 
          isMobile={true}
          onCloseMobile={() => setMobileDrawerOpen(false)} 
          onOpenSettings={() => {
            setMobileDrawerOpen(false);
            setSettingsOpen(true);
          }} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Slim Contextual Header */}
        <Header 
          onToggleMobileDrawer={() => setMobileDrawerOpen(prev => !prev)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
