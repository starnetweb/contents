"use client";
import { useEffect, useState } from "react";
import { getBrands, toggleBrand, updateBrandTelegram } from "@/lib/api";

const BRAND_COLORS: Record<string, string> = {
  blazingprojects: "#3b82f6",
  examkits: "#10b981",
  watmall: "#f59e0b",
  payapp: "#8b5cf6",
  realtour: "#ef4444",
  "stanet-academy": "#06b6d4",
};

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [telegramInputs, setTelegramInputs] = useState<Record<string, string>>({});
  const [savingTelegram, setSavingTelegram] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    const { data } = await getBrands();
    setBrands(data);
    // Pre-fill telegram inputs with existing values
    const inputs: Record<string, string> = {};
    data.forEach((b: any) => { inputs[b.id] = b.telegram_chat_id || ""; });
    setTelegramInputs(inputs);
    setLoading(false);
  };

  const handleToggle = async (brand: any) => {
    setToggling(brand.id);
    try {
      const { data } = await toggleBrand(brand.id);
      setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, is_active: data.is_active } : b));
      showMsg(brand.id, data.is_active ? "Brand enabled" : "Brand disabled");
    } catch {
      showMsg(brand.id, "Error updating brand");
    }
    setToggling(null);
  };

  const handleSaveTelegram = async (brand: any) => {
    setSavingTelegram(brand.id);
    try {
      await updateBrandTelegram(brand.id, telegramInputs[brand.id] || "");
      showMsg(brand.id, "Telegram chat ID saved");
      fetchBrands();
    } catch {
      showMsg(brand.id, "Error saving chat ID");
    }
    setSavingTelegram(null);
  };

  const showMsg = (id: string, text: string) => {
    setMsg((m) => ({ ...m, [id]: text }));
    setTimeout(() => setMsg((m) => { const n = { ...m }; delete n[id]; return n; }), 3000);
  };

  const activeCount = brands.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeCount} of {brands.length} brands active — only active brands generate content
          </p>
        </div>
      </div>

      {/* Active/Inactive summary bar */}
      <div className="flex gap-3">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-green-400 font-semibold">{activeCount} Active</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <span className="text-gray-400 font-semibold">{brands.length - activeCount} Inactive</span>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Loading brands...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {brands.map((brand) => (
            <div key={brand.id}
              className={`bg-gray-900 rounded-xl border transition-all ${brand.is_active ? "border-gray-700" : "border-gray-800 opacity-60"}`}>
              {/* Brand Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: BRAND_COLORS[brand.slug] || "#6b7280" }}>
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{brand.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${brand.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                        {brand.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <a href={brand.website} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300">{brand.website}</a>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(brand)}
                  disabled={toggling === brand.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${brand.is_active ? "bg-blue-600" : "bg-gray-700"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${brand.is_active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Brand Details */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-400">{brand.description}</p>

                {/* Platforms */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Platforms</p>
                  <div className="flex gap-2 flex-wrap">
                    {brand.platforms.map((p: string) => (
                      <span key={p} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                        {PLATFORM_EMOJI[p]} {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telegram Chat ID */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                    Telegram Chat ID
                    {brand.has_telegram && <span className="ml-2 text-green-400 normal-case">● Connected</span>}
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={telegramInputs[brand.id] || ""}
                      onChange={(e) => setTelegramInputs({ ...telegramInputs, [brand.id]: e.target.value })}
                      placeholder="-100123456789"
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSaveTelegram(brand)}
                      disabled={savingTelegram === brand.id}
                      className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                      {savingTelegram === brand.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {msg[brand.id] && <p className="text-xs mt-1.5 text-gray-400">{msg[brand.id]}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
