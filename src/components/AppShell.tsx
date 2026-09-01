"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { BottomTabBar } from "@/components/BottomTabBar";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar userEmail={userEmail} onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <BottomTabBar onOpenMenu={() => setDrawerOpen(true)} />
    </div>
  );
}
