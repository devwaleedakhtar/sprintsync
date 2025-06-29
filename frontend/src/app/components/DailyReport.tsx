"use client";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useState, useEffect } from "react";
import type { UserProfile } from "@/auth";
import ReactMarkdown from "react-markdown";
import { BoltIcon } from "@heroicons/react/24/outline";

interface DailyPlan {
  user_id: string;
  date: string;
  plan: string;
}

interface DailyReportProps {
  triggerRefresh: () => void;
}

// Utility to buffer only complete markdown blocks (render up to last newline)
function getRenderableMarkdown(markdown: string) {
  const lastNewline = markdown.lastIndexOf("\n");
  if (lastNewline === -1) return "";
  return markdown.slice(0, lastNewline + 1);
}

export default function DailyReport({ triggerRefresh }: DailyReportProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;
  const [streamedPlan, setStreamedPlan] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [history, setHistory] = useState<DailyPlan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!accessToken) return;
    setStreamedPlan("");
    setStreaming(true);
    setError("");
    try {
      const response = await fetch(
        `${api.defaults.baseURL}/ai/daily-plan/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let result = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        // Extract only the chunk after 'data: '
        const matches = result.match(/data: ([^\n]*)/g);
        let text = "";
        if (matches) {
          text = matches.map((m) => m.replace("data: ", "")).join("");
        }
        setStreamedPlan(text);
      }
    } catch {
      setError("Failed to generate daily plan");
    } finally {
      setStreaming(false);
      triggerRefresh();
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    setLoadingHistory(true);
    setError("");
    api
      .get("/ai/daily-plan/history", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setHistory(res.data))
      .catch(() => setError("Could not fetch daily plan history."))
      .finally(() => setLoadingHistory(false));
  }, [accessToken, streamedPlan]);

  return (
    <section className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Daily Planning</h2>
        <button
          className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleGenerate}
          title="Generate Daily Plan"
          aria-label="Generate Daily Plan"
        >
          <BoltIcon className="w-6 h-6 text-blue-600" />
        </button>
      </div>
      {/* Show currently generating plan at the top of the list */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Previous Daily Plans</h3>
        {streaming && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg shadow-sm p-5 flex flex-col gap-2 animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-4 h-4 text-blue-500 animate-spin"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Generating...
              </span>
            </div>
            <div className="text-sm prose prose-blue max-w-none relative">
              <ReactMarkdown>
                {getRenderableMarkdown(streamedPlan) || "Generating..."}
              </ReactMarkdown>
              {/* Animated ellipsis at the end while streaming */}
              <span className="absolute -bottom-1 left-0 text-blue-400 animate-pulse text-lg select-none">
                &nbsp;...
              </span>
            </div>
          </div>
        )}
        {loadingHistory && !streaming ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : history.length === 0 && !streaming ? (
          <div className="text-gray-600">No daily plans found.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {history.map((plan) => (
              <div
                key={plan.date + plan.user_id}
                className="bg-white border border-blue-100 rounded-lg shadow-sm p-5"
              >
                <div className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                  {plan.date}
                </div>
                <div className="text-sm prose prose-blue max-w-none">
                  <ReactMarkdown>{plan.plan}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
