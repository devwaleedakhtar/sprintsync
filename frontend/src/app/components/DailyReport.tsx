"use client";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/auth";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DailyPlan {
  user_id: string;
  date: string;
  plan: string;
}

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function DailyReport() {
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;
  const [report, setReport] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    api
      .get(`${backendUrl}/ai/daily-plan`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setReport(res.data))
      .catch(() => setError("Could not fetch daily agenda."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!report) return undefined;

  return (
    <section className="w-full max-w-2xl mx-auto mb-8">
      <button
        type="button"
        className="flex items-center gap-2 text-lg font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="agenda-content"
      >
        {collapsed ? (
          <ChevronRightIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
        Today&apos;s Agenda
      </button>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : report ? (
        !collapsed && (
          <div
            id="agenda-content"
            className="bg-blue-50 border border-blue-200 rounded p-4 whitespace-pre-line"
            aria-hidden={collapsed}
          >
            {report.plan}
          </div>
        )
      ) : (
        <div className="text-gray-600">No agenda found for today.</div>
      )}
    </section>
  );
}
