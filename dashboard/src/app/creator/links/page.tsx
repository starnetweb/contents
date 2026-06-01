"use client";
import { useEffect, useState } from "react";
import { getLinkStatus, submitLink } from "@/lib/api";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

export default function LinksPage() {
  const [linkStatus, setLinkStatus] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  useEffect(() => { fetchStatus(); }, [date]);

  const fetchStatus = () =>
    getLinkStatus(date).then((r) => {
      setLinkStatus(r.data);
      setActiveTab((t) => Math.min(t, r.data.length - 1 < 0 ? 0 : r.data.length - 1));
    });

  const handleSaveBrand = async () => {
    const brand = linkStatus[activeTab];
    if (!brand) return;
    const entries = Object.entries(brand.platforms as Record<string, any>)
      .map(([platform]) => ({
        platform,
        url: urlInputs[`${brand.brand_slug}-${platform}`]?.trim() || "",
      }))
      .filter((e) => e.url);

    if (!entries.length) {
      setSavedMsg("⚠️ No URLs entered");
      setTimeout(() => setSavedMsg(""), 3000);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        entries.map((e) =>
          submitLink({ brand_slug: brand.brand_slug, platform: e.platform, url: e.url, date })
        )
      );
      // Clear saved inputs for this brand
      const cleared: Record<string, string> = { ...urlInputs };
      entries.forEach((e) => { delete cleared[`${brand.brand_slug}-${e.platform}`]; });
      setUrlInputs(cleared);
      setSavedMsg(`✅ Saved ${entries.length} link${entries.length > 1 ? "s" : ""}`);
      fetchStatus();
    } catch {
      setSavedMsg("❌ Error saving");
    }
    setSaving(false);
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const brand = linkStatus[activeTab];
  const brandInputsDirty = brand
    ? Object.entries(brand.platforms as Record<string, any>).some(
        ([platform]) => !!urlInputs[`${brand.brand_slug}-${platform}`]?.trim()
      )
    : false;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Submit Post Links</h1>
        <input
          type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
        />
      </div>

      <p className="text-gray-400 text-sm">
        Select a brand, paste post URLs, then click <strong className="text-white">Save Links</strong>.
        Reminder sent at 4:00 PM WAT for any missing links.
      </p>

      {linkStatus.length === 0 && (
        <div className="text-gray-500 text-sm py-10 text-center">No brands found.</div>
      )}

      {linkStatus.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Brand Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-800 scrollbar-none">
            {linkStatus.map((b, i) => (
              <button
                key={b.brand_slug}
                onClick={() => { setActiveTab(i); setSavedMsg(""); }}
                className={`flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === i
                    ? "border-blue-500 text-white bg-gray-800/50"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                {b.brand_name}
                {b.all_submitted
                  ? <span className="ml-2 text-green-400 text-xs">✓</span>
                  : <span className="ml-2 text-yellow-400 text-xs">●</span>}
              </button>
            ))}
          </div>

          {/* Active Brand Content */}
          {brand && (
            <div className="p-5 space-y-4">
              {/* Brand status badge */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  brand.all_submitted
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {brand.all_submitted ? "All links submitted ✓" : "Missing some links"}
                </span>
                <span className="text-xs text-gray-500">{brand.brand_name}</span>
              </div>

              {/* Platform inputs */}
              {Object.entries(brand.platforms as Record<string, any>).map(([platform, data]: [string, any]) => {
                const key = `${brand.brand_slug}-${platform}`;
                return (
                  <div key={platform} className={`rounded-lg p-4 border ${
                    data.submitted ? "bg-green-500/5 border-green-500/20" : "bg-gray-800 border-gray-700"
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span>{PLATFORM_EMOJI[platform]}</span>
                      <span className="text-sm font-medium text-white capitalize">{platform}</span>
                      {data.submitted && (
                        <span className="ml-auto text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          ✓ Submitted
                        </span>
                      )}
                    </div>
                    {data.submitted && data.url && (
                      <a href={data.url} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 break-all block mb-3 bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/10">
                        {data.url}
                      </a>
                    )}
                    <input
                      value={urlInputs[key] || ""}
                      onChange={(e) => setUrlInputs({ ...urlInputs, [key]: e.target.value })}
                      placeholder={data.submitted ? "Paste new URL to update..." : "Paste post URL here..."}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                );
              })}

              {/* Save button */}
              <div className="flex items-center justify-between pt-2">
                {savedMsg
                  ? <span className="text-sm text-gray-300">{savedMsg}</span>
                  : <span className="text-xs text-gray-500">Fill in URLs above then save</span>
                }
                <button
                  onClick={handleSaveBrand}
                  disabled={saving || !brandInputsDirty}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Save Links"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
