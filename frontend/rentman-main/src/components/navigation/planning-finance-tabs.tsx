"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PLANNING_DEFAULT_ROUTE = "/dashboard";
const FINANCE_DEFAULT_ROUTE = "/finance";

export function PlanningFinanceTabs() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const isFinance = pathname.startsWith("/finance");

  const tabs: Array<{
    label: string;
    active: boolean;
    onClick: () => void;
  }> = [
    {
      label: "Planning",
      active: !isFinance,
      onClick: () => {
        if (!isFinance) return;
        router.push(PLANNING_DEFAULT_ROUTE);
      },
    },
    {
      label: "Finance",
      active: isFinance,
      onClick: () => {
        if (isFinance) return;
        router.push(FINANCE_DEFAULT_ROUTE);
      },
    },
  ];

  return (
    <nav className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={tab.onClick}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60",
            tab.active
              ? "bg-primary text-white shadow"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
