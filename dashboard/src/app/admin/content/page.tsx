"use client";
import { useEffect, useState } from "react";
import { getContent, approveContent, getBrands } from "@/lib/api";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

const TYPE_COLOR: Record<string, string> = {
  carousel: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  post: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function ContentPage() {
  const [contentDays, setContentDays] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then((r) => setBrands(r.data));
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const params: any = {};
    if (selectedBrand) params.brand_slug = selectedBrand;
    if (selectedDate) params.date = selectedDate;
    const { data } = await getContent(params);
    setContentDays(data);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, [selectedBrand, selectedDate]);

  const approve = async (id: string) => {
    await approveContent(id);
    fetchContent();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
        <div className="flex gap-3">
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
            <option value="">All Brands</option>
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
        </div>
      </div>

      {loading ? <div className="text-gray-400 text-center py-12">Loading content...</div> : contentDays.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">📭</div>
          <p>No content found. Use "Generate Now" on the overview page.</p>
        </div>
      ) : contentDays.map((day) => (
        <div key={day.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-white">{day.brand_name}</h3>
                <p className="text-sm text-gray-400">For: {day.for_date} · Generated: {new Date(day.generated_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full border ${day.status === "approved" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"}`}>
                {day.status}
              </span>
              {day.status !== "approved" && (
                <button onClick={() => approve(day.id)}
                  className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
                  Approve
                </button>
              )}
              <button onClick={() => setExpanded(expanded === day.id ? null : day.id)}
                className="text-gray-400 hover:text-white text-sm px-3 py-1.5 bg-gray-800 rounded-lg transition-colors">
                {expanded === day.id ? "▲ Hide" : "▼ View"}
              </button>
            </div>
          </div>

          {expanded === day.id && (
            <div className="border-t border-gray-800 px-5 py-5">
              {/* Central Idea Banner */}
              {day.cards?.[0]?.central_idea && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                  <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Content Angle</p>
                  <p className="text-white font-semibold">{day.cards[0].central_idea}</p>
                  {day.cards[0].news_source && (
                    <p className="text-xs text-gray-400 mt-1">Source: {day.cards[0].news_source}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {day.cards?.map((card: any, i: number) => {
                  const cardKey = `${day.id}-${card.platform}`;
                  const isCardExpanded = expandedCard === cardKey;
                  return (
                    <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{PLATFORM_EMOJI[card.platform]}</span>
                          <span className="font-semibold text-white text-sm capitalize">{card.platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLOR[card.type] || "bg-gray-700 text-gray-400 border-gray-600"}`}>
                            {card.type}
                          </span>
                          <span className="text-xs text-gray-400">⏰ {card.posting_time}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Hook</p>
                          <p className="text-sm text-blue-300 italic">"{card.hook}"</p>
                        </div>
                        {card.type === "carousel" && card.slides && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Slides</p>
                            <div className="space-y-1">
                              {card.slides.map((s: any) => (
                                <div key={s.slide} className="text-xs bg-gray-900 rounded px-2 py-1.5">
                                  <span className="text-gray-500">Slide {s.slide}: </span>
                                  <span className="text-white font-medium">{s.heading}</span>
                                  {isCardExpanded && <p className="text-gray-400 mt-0.5">{s.body}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {card.type === "video" && isCardExpanded && card.script && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Script</p>
                            <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{card.script}</p>
                          </div>
                        )}
                        {card.type === "post" && card.thread && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Thread</p>
                            <div className="space-y-1">
                              {card.thread.map((t: string, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-900 rounded px-2 py-1.5 text-gray-300">
                                  <span className="text-gray-500">{idx + 1}.</span>{" "}
                                  {isCardExpanded ? t : t.slice(0, 80) + (t.length > 80 ? "..." : "")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Caption</p>
                          <p className={`text-xs text-gray-300 ${isCardExpanded ? "" : "line-clamp-3"}`}>{card.caption}</p>
                        </div>
                        {isCardExpanded && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium mb-1">CTA</p>
                              <p className="text-xs text-green-400">{card.cta}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cover / Thumbnail Prompt</p>
                              <p className="text-xs text-yellow-300 leading-relaxed">{card.cover_prompt}</p>
                            </div>
                          </>
                        )}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {card.hashtags?.slice(0, isCardExpanded ? 10 : 3).map((h: string) => (
                            <span key={h} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{h}</span>
                          ))}
                          {!isCardExpanded && card.hashtags?.length > 3 && (
                            <span className="text-xs text-gray-500">+{card.hashtags.length - 3} more</span>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedCard(isCardExpanded ? null : cardKey)}
                          className="w-full text-xs text-gray-500 hover:text-gray-300 pt-1 transition-colors">
                          {isCardExpanded ? "▲ Show less" : "▼ Show full content"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
