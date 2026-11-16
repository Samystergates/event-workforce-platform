"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { PlanningFinanceTabs } from "@/components/navigation/planning-finance-tabs";
import { IconsComponent } from "@/components/common/icons.component";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const financeNavLinks = [
  { label: "Invoices", href: "/finance/invoices" },
  { label: "Matches", href: "/finance/matches" },
  { label: "Transactions", href: "/finance/transactions" },
];

interface FinanceLayoutShellProps {
  children: ReactNode;
  onLogout: () => void;
  loadingLogout: boolean;
}

export function FinanceLayoutShell({
  children,
  onLogout,
  loadingLogout,
}: FinanceLayoutShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileNav = () => setMobileOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden rounded-md border border-border p-2"
              onClick={toggleMobileNav}
              aria-label="Toggle finance navigation"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <PlanningFinanceTabs />
          </div>
          <Button
            onClick={onLogout}
            disabled={loadingLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {loadingLogout ? (
              <IconsComponent.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <FiLogOut className="h-4 w-4" />
            )}
            <span>Uitloggen</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-white p-4 transition-transform lg:static lg:translate-x-0 lg:flex lg:w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="flex w-full flex-col gap-2">
            {financeNavLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white shadow"
                      : "hover:bg-muted hover:text-foreground text-muted-foreground"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto px-4 py-6 lg:ml-0 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
