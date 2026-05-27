"use client";
import { useEffect, useState } from "react";
import { getLinkStatus, submitLink, getBrands } from "@/lib/api";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

export default function LinksPage() {
  const [linkStatus, setLinkStatus] = useState<any[]>([]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  useEffect(() => { fetchStatus(); }, [date]);
  const fetchStatus = () => getLinkStatus(date).then((r) => setLinkStatus(r.data));

  const handleSubmit = async (brand_slug: string, platform: string) => {
    const key = `${brand_slug}-${platform}`;
    const url = urlInputs[key]?.trim();
    if (!url) return;
    setSubmitting(key);
    try {
      await submitLink({ brand_slug, platform, url, date });
      setMsg({ ...msg, [key]: "✅ Saved" });
      setUrlInputs({ ...urlInputs, [key]: "" });
      fetchStatus();
    } catch {
      setMsg({ ...msg, [key]: "❌ Error" });
    }
    setSubmitting(null);
    setTimeout(() => setMsg((m) => { const n = { ...m }; delete n[key]; return n; }), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Submit Post Links</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
      </div>

      <p className="text-gray-400 text-sm">
        After posting on each platform, paste the live post URL below. Reminder is sent at 4:00 PM WAT for any missing links.
      </p>

      {linkStatus.map((brand) => (
        <div key={brand.brand_slug} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">{brand.brand_name}</h3>
            {brand.all_submitted
              ? <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">All submitted ✓</span>
              : <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">Pending links</span>}
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(brand.platforms as Record<string, any>).map(([platform, data]: [string, any]) => {
              const key = `${brand.brand_slug}-${platform}`;
              return (
                <div key={platform} className={`rounded-lg p-3 border ${data.submitted ? "bg-green-500/5 border-green-500/20" : "bg-gray-800 border-gray-700"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{PLATFORM_EMOJI[platform]}</span>
                    <span className="text-sm font-medium text-white capitalize">{platform}</span>
                    {data.submitted && <span className="text-xs text-green-400 ml-auto">✓ Submitted</span>}
                  </div>
                  {data.submitted && data.url && (
                    <a href={data.url} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 break-all block mb-2">
                      {data.url}
                    </a>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={urlInputs[key] || ""}
                      onChange={(e) => setUrlInputs({ ...urlInputs, [key]: e.target.value })}
                      placeholder={data.submitted ? "Update link URL..." : "Paste post URL here..."}
                      className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(brand.brand_slug, platform)}
                    />
                    <button
                      onClick={() => handleSubmit(brand.brand_slug, platform)}
                      disabled={submitting === key || !urlInputs[key]?.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                      {submitting === key ? "..." : data.submitted ? "Update" : "Submit"}
                    </button>
                  </div>
                  {msg[key] && <p className="text-xs mt-1 text-gray-400">{msg[key]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
