"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SettingsModal from "./SettingsModal";
import OfflineSyncBanner from "./OfflineSyncBanner";
import { PWAProvider } from "@/context/PWAContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Route protection: if finished loading and unauthenticated on a protected page, navigate to /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isAuthPage, router]);

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

  // Initial authentication loading state from localStorage
  if (isLoading && !isAuthPage) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-900 to-indigo-900 p-3.5 rounded-2xl border border-blue-400/30 shadow-lg animate-pulse">
            <Compass className="h-8 w-8 text-white animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-blue-950 tracking-wider font-sans">ORCA</h2>
            <p className="text-xs text-slate-400 font-mono">Initializing Marine Intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated and on a protected route, render loading redirect
  if (!isAuthenticated && !isAuthPage) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-900 to-indigo-900 p-3.5 rounded-2xl border border-blue-400/30 shadow-lg animate-pulse">
            <Compass className="h-8 w-8 text-white animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-blue-950 tracking-wider font-sans">ORCA</h2>
            <p className="text-xs text-slate-500 font-mono">Please sign in to access your marine dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <OfflineSyncBanner />
        {children}
      </div>
    );
  }

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

        {/* Sticky PWA Offline & Background Sync Banner */}
        <OfflineSyncBanner />

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

export default function AppShell({ children }: AppShellProps) {
  return (
    <AuthProvider>
      <PWAProvider>
        <AppShellInner>
          {children}
        </AppShellInner>
      </PWAProvider>
    </AuthProvider>
  );
}
