"use client";
import { useEffect, useState } from "react";
import { getScores, getScoreHistory, getBrands } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const BRAND_COLORS: Record<string, string> = {
  blazingprojects: "#3b82f6", examkits: "#10b981", watmall: "#f59e0b",
  payapp: "#8b5cf6", realtour: "#ef4444", "stanet-academy": "#06b6d4",
};

const scoreColor = (s: number) => s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400";

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [period, setPeriod] = useState("weekly");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then((r) => {
      setBrands(r.data);
      if (r.data.length > 0) setSelectedBrand(r.data[0].slug);
    });
  }, []);

  useEffect(() => { fetchScores(); }, [period]);
  useEffect(() => { if (selectedBrand) fetchHistory(); }, [selectedBrand, period]);

  const fetchScores = async () => {
    setLoading(true);
    const { data } = await getScores({ period });
    setScores(data);
    setLoading(false);
  };

  const fetchHistory = async () => {
    const { data } = await getScoreHistory(selectedBrand, period === "monthly" ? "monthly" : period === "weekly" ? "weekly" : "daily");
    setHistory(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Scores</h1>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-sm px-4 py-2 rounded-lg capitalize transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center text-gray-400 py-8">Loading...</div> :
          scores.map((s) => (
            <div key={s.brand_slug} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS[s.brand_slug] || "#6b7280" }} />
                <span className="text-white font-semibold text-sm">{s.brand_name}</span>
              </div>
              <div className={`text-4xl font-bold mb-3 ${scoreColor(s.score)}`}>{s.score.toFixed(1)}</div>
              <div className="space-y-1 text-xs text-gray-400">
                {s.breakdown?.link_submission != null && <div className="flex justify-between"><span>Link submitted</span><span className="text-white">{s.breakdown.link_submission?.toFixed(1)}/20</span></div>}
                {s.breakdown?.on_time_posting != null && <div className="flex justify-between"><span>On-time posting</span><span className="text-white">{s.breakdown.on_time_posting?.toFixed(1)}/30</span></div>}
                {s.breakdown?.engagement != null && <div className="flex justify-between"><span>Engagement</span><span className="text-white">{s.breakdown.engagement?.toFixed(1)}/30</span></div>}
                {s.breakdown?.reach != null && <div className="flex justify-between"><span>Reach</span><span className="text-white">{s.breakdown.reach?.toFixed(1)}/20</span></div>}
                {s.breakdown?.trend && <div className="flex justify-between"><span>Trend</span><span className={s.breakdown.trend === "improving" ? "text-green-400" : s.breakdown.trend === "declining" ? "text-red-400" : "text-gray-400"}>{s.breakdown.trend}</span></div>}
              </div>
            </div>
          ))
        }
      </div>

      {/* History Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Score History</h2>
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
        {history.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500">No history data yet</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="period_key" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} />
                <Line type="monotone" dataKey="score" stroke={BRAND_COLORS[selectedBrand] || "#3b82f6"} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
