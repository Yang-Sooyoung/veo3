'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from "@/lib/store/ui-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainArea } from "@/components/layout/MainArea";
import { RightPanel } from "@/components/layout/RightPanel";
import { cn } from "@/lib/utils";

export default function Home() {
  const { sidebarCollapsed, rightPanelVisible, setSidebarCollapsed } = useUIStore();

  // Memoize resize handler
  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  // Memoize sidebar close handler
  const handleCloseSidebar = useCallback(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  // Memoize keyboard handler for sidebar backdrop
  const handleBackdropKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  // Auto-collapse sidebar on mobile on mount
  useEffect(() => {
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Agent List */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-0 md:w-16" : "w-64 md:w-72 lg:w-80",
          "hidden md:block"
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-80 border-r border-border bg-card transition-transform duration-300 md:hidden",
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0",
          "shadow-2xl"
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={handleCloseSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onKeyDown={handleBackdropKeyDown}
        />
      )}

      {/* Main Area - Chat Interface */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0">
        <MainArea />
      </main>

      {/* Right Panel - Agent Details (Optional) */}
      {rightPanelVisible && (
        <aside
          className={cn(
            "flex-shrink-0 border-l border-border bg-card transition-all duration-300",
            "w-0 lg:w-80 xl:w-96",
            "hidden lg:block"
          )}
        >
          <RightPanel />
        </aside>
      )}
      </div>
    </>
  );
}
