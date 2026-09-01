"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { AuditEvent } from "@/types/guard";
import { Terminal } from "lucide-react";

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/audit");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 grid-background">
      <AppNavbar />

      <div className="flex-1 flex">
        <AppSidebar />

        <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full font-mono">
          <div className="border-b border-[#262626] pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-yellow-400" />
              <h1 className="text-xl font-bold text-neutral-100">Immutable Audit Trail Explorer</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Complete, cryptographically chained sequence of all agent procurement intents, policy evaluations, tamper breaches, and signature authorizations.
            </p>
          </div>

          <AuditTimeline events={events} onRefresh={fetchAudit} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}
