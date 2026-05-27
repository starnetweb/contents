"use client";
import { useEffect, useState } from "react";
import { getContent, getBrands } from "@/lib/api";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

const TYPE_COLOR: Record<string, string> = {
  carousel: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  post: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function ContentHistoryPage() {
  const [contentDays, setContentDays] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then((r) => setBrands(r.data));
  }, []);

  useEffect(() => {
    fetchContent();
  }, [selectedBrand, selectedDate]);

  const fetchContent = async () => {
    setLoading(true);
    const params: any = {};
    if (selectedBrand) params.brand_slug = selectedBrand;
    if (selectedDate) params.date = selectedDate;
    try {
      const { data } = await getContent(params);
      setContentDays(data);
    } catch { setContentDays([]); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Content History</h1>
          <p className="text-gray-400 text-sm mt-1">Browse all generated content for reference</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          {(selectedBrand || selectedDate) && (
            <button
              onClick={() => { setSelectedBrand(""); setSelectedDate(""); }}
              className="text-sm text-gray-400 hover:text-white px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-gray-400 text-center py-16">Loading content history...</div>
      ) : contentDays.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🗂️</div>
          <p className="text-lg font-medium text-gray-400">No content found</p>
          <p className="text-sm mt-1">
            {selectedBrand || selectedDate ? "Try adjusting your filters." : "Content will appear here once generated."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contentDays.map((day) => {
            const centralIdea = day.cards?.[0]?.central_idea;
            const newsSource = day.cards?.[0]?.news_source;
            const isExpanded = expandedDay === day.id;

            return (
              <div key={day.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Row header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{day.brand_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          day.status === "sent"
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : day.status === "approved"
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                            : "bg-gray-700 border-gray-600 text-gray-400"
                        }`}>
                          {day.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📅 {day.for_date} &nbsp;·&nbsp; Generated {new Date(day.generated_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {centralIdea && (
                        <p className="text-sm text-gray-300 mt-1 truncate max-w-xl">{centralIdea}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                    className="ml-4 text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {isExpanded ? "▲ Hide" : "▼ View Content"}
                  </button>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="border-t border-gray-800 px-5 py-5">
                    {/* Central Idea Banner */}
                    {centralIdea && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Content Angle</p>
                        <p className="text-white font-semibold">{centralIdea}</p>
                        {newsSource && (
                          <p className="text-xs text-gray-400 mt-1">Source: {newsSource}</p>
                        )}
                      </div>
                    )}

                    {/* Platform cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {day.cards?.map((card: any, i: number) => {
                        const cardKey = `${day.id}-${card.platform}`;
                        const isCardExpanded = expandedCard === cardKey;

                        return (
                          <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            {/* Card header */}
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

                            {/* Card body */}
                            <div className="p-4 space-y-3">
                              {/* Hook */}
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Hook</p>
                                <p className="text-sm text-blue-300 italic">"{card.hook}"</p>
                              </div>

                              {/* Slides */}
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

                              {/* Script for video */}
                              {card.type === "video" && isCardExpanded && card.script && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Script</p>
                                  <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{card.script}</p>
                                </div>
                              )}

                              {/* Thread for twitter */}
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

                              {/* Caption */}
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Caption</p>
                                <p className={`text-xs text-gray-300 ${isCardExpanded ? "" : "line-clamp-3"}`}>{card.caption}</p>
                              </div>

                              {/* Expanded extras */}
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

                              {/* Hashtags */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {card.hashtags?.slice(0, isCardExpanded ? 10 : 3).map((h: string) => (
                                  <span key={h} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{h}</span>
                                ))}
                                {!isCardExpanded && card.hashtags?.length > 3 && (
                                  <span className="text-xs text-gray-500">+{card.hashtags.length - 3} more</span>
                                )}
                              </div>

                              {/* Expand toggle */}
                              <button
                                onClick={() => setExpandedCard(isCardExpanded ? null : cardKey)}
                                className="w-full text-xs text-gray-500 hover:text-gray-300 pt-1 transition-colors"
                              >
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
            );
          })}
        </div>
      )}
    </div>
  );
}
