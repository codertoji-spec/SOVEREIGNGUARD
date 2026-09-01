"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Sliders,
  Search,
  FileCheck2,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Security Console",
    href: "/console",
    icon: ShieldAlert,
  },
  {
    label: "Policy Manager",
    href: "/policies",
    icon: Sliders,
  },
  {
    label: "Evidence Matrix",
    href: "/evidence",
    icon: Search,
  },
  {
    label: "Audit Trail",
    href: "/audit",
    icon: Terminal,
  },
  {
    label: "Sponsor Hub",
    href: "/integrations",
    icon: Layers,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#262626] bg-[#0a0a0a]/90 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
            Authorization Gateway
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    isActive
                      ? "bg-yellow-950/30 text-yellow-400 border border-yellow-600/50 shadow-sm shadow-yellow-950/20 font-semibold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-yellow-400" : "text-neutral-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-lg border border-[#262626] bg-[#101010] space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-neutral-300">
            <Lock className="w-3.5 h-3.5 text-yellow-400" />
            <span>Core Firewall Invariant</span>
          </div>
          <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
            AI Can Propose.<br />
            AI Can Analyze.<br />
            AI Can Prepare.<br />
            <strong className="text-yellow-400 font-bold">AI Cannot Bypass Authorization.</strong>
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#262626] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 px-2">
          <span>Defense Status:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
