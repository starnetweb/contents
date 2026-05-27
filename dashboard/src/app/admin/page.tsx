"use client";
import { useEffect, useState } from "react";
import { getLeaderboard, getLinkStatus, getScores, triggerGeneration, triggerSend, recalculateScores } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BRAND_COLORS: Record<string, string> = {
  blazingprojects: "#3b82f6",
  examkits: "#10b981",
  watmall: "#f59e0b",
  payapp: "#8b5cf6",
  realtour: "#ef4444",
  "stanet-academy": "#06b6d4",
};

const scoreColor = (s: number) => s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400";
const scoreBg = (s: number) => s >= 80 ? "bg-green-500/20 border-green-500/30" : s >= 50 ? "bg-yellow-500/20 border-yellow-500/30" : "bg-red-500/20 border-red-500/30";

export default function AdminDashboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [linkStatus, setLinkStatus] = useState<any[]>([]);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lb, ls] = await Promise.all([getLeaderboard(period), getLinkStatus(tomorrow)]);
      setLeaderboard(lb.data);
      setLinkStatus(ls.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const action = async (fn: () => Promise<any>, label: string) => {
    setMsg(`${label}...`);
    try {
      const res = await fn();
      const data = res?.data;
      setMsg(data?.message || `${label} started`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "failed";
      setMsg(`Error: ${detail}`);
    }
    setTimeout(() => setMsg(""), 6000);
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();
  const allLinksIn = linkStatus.every((b) => b.all_submitted);
  const missingCount = linkStatus.filter((b) => !b.all_submitted).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Today: {today}</p>
        </div>
        <div className="flex gap-3">
          {msg && <span className="text-sm text-gray-300 self-center">{msg}</span>}
          <button onClick={() => action(triggerGeneration, "Content generation")}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            ⚡ Generate Now
          </button>
          <button onClick={() => action(triggerSend, "Telegram send")}
            className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            📤 Send to Telegram
          </button>
          <button onClick={() => action(recalculateScores, "Score recalculation")}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            🔄 Recalculate
          </button>
        </div>
      </div>

      {/* Link Status Banner */}
      <div className={`rounded-xl p-4 border ${allLinksIn ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{allLinksIn ? "✅" : "⚠️"}</span>
          <div>
            <p className="font-semibold text-white">
              {allLinksIn ? "All post links submitted for today!" : `${missingCount} brand${missingCount !== 1 ? "s" : ""} missing post links`}
            </p>
            <p className="text-sm text-gray-400">Reminder sent automatically at 4:00 PM WAT if missing</p>
          </div>
        </div>
      </div>

      {/* Brand Link Status Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Tomorrow's Post Links <span className="text-gray-500 text-sm font-normal">({tomorrow})</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkStatus.map((brand) => {
            const submitted = Object.values(brand.platforms as Record<string, any>).filter((p: any) => p.submitted).length;
            const total = Object.keys(brand.platforms).length;
            return (
              <div key={brand.brand_slug} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS[brand.brand_slug] || "#6b7280" }} />
                    <span className="font-semibold text-white text-sm">{brand.brand_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${brand.all_submitted ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {submitted}/{total}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(brand.platforms as Record<string, any>).map(([platform, data]: [string, any]) => (
                    <span key={platform}
                      className={`text-xs px-2 py-1 rounded-md border ${data.submitted ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-gray-800 border-gray-700 text-gray-500"}`}>
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Brand Leaderboard</h2>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading scores...</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No scores yet. Generate and submit content to see scores.</div>
          ) : (
            <>
              <div className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis type="category" dataKey="brand_name" tick={{ fill: "#d1d5db", fontSize: 12 }} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff" }} itemStyle={{ color: "#60a5fa" }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {leaderboard.map((entry) => (
                        <Cell key={entry.brand_slug} fill={BRAND_COLORS[entry.brand_slug] || "#6b7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="border-t border-gray-800">
                {leaderboard.map((entry, i) => (
                  <div key={entry.brand_slug} className="flex items-center justify-between px-6 py-3 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                        {entry.rank}
                      </span>
                      <span className="text-white font-medium">{entry.brand_name}</span>
                    </div>
                    <span className={`font-bold text-lg ${scoreColor(entry.score)}`}>{entry.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
