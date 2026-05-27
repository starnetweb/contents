"use client";
import { useEffect, useState } from "react";
import { getLinkStatus, getScores, getContent } from "@/lib/api";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

const TYPE_COLOR: Record<string, string> = {
  carousel: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  post: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function CreatorDashboard() {
  const [linkStatus, setLinkStatus] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [tomorrowContent, setTomorrowContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const today = getToday();
  const tomorrow = getTomorrow();

  useEffect(() => {
    Promise.all([
      getLinkStatus(tomorrow),
      getScores({ period: "daily" }),
      getContent({ date: tomorrow })
    ]).then(([ls, sc, ct]) => {
      setLinkStatus(ls.data);
      setScores(sc.data);
      setTomorrowContent(ct.data);
    }).finally(() => setLoading(false));
  }, []);

  const getScore = (slug: string) => scores.find((s) => s.brand_slug === slug)?.score || 0;
  const scoreColor = (s: number) => s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400";
  const getContentForBrand = (slug: string) => tomorrowContent.find((c) => c.brand_slug === slug);

  if (loading) return <div className="text-gray-400 text-center py-16">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Today: {today} &nbsp;·&nbsp; Posting for: <span className="text-blue-400 font-medium">{tomorrow}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{linkStatus.filter((b) => b.all_submitted).length}</div>
          <div className="text-xs text-gray-400 mt-1">Brands fully linked</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{linkStatus.filter((b) => !b.all_submitted).length}</div>
          <div className="text-xs text-gray-400 mt-1">Pending links</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{tomorrowContent.length}</div>
          <div className="text-xs text-gray-400 mt-1">Brands with content</div>
        </div>
      </div>

      {/* Brand Cards */}
      <div className="space-y-4">
        {linkStatus.map((brand) => {
          const submitted = Object.values(brand.platforms as Record<string, any>).filter((p: any) => p.submitted).length;
          const total = Object.keys(brand.platforms).length;
          const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
          const score = getScore(brand.brand_slug);
          const contentDay = getContentForBrand(brand.brand_slug);
          const isExpanded = expandedBrand === brand.brand_slug;

          return (
            <div key={brand.brand_slug} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

              {/* Brand Header Row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{brand.brand_name}</span>
                  {!brand.has_content ? (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">No content yet</span>
                  ) : (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Content ready</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{submitted}/{total}</span>
                  <span className={`font-bold text-sm ${scoreColor(score)}`}>{score.toFixed(0)} pts</span>
                  {contentDay && (
                    <button
                      onClick={() => setExpandedBrand(isExpanded ? null : brand.brand_slug)}
                      className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      {isExpanded ? "▲ Hide" : "▼ View Content"}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress + Platform Pills */}
              <div className="px-5 pb-4">
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(brand.platforms as Record<string, any>).map(([platform, data]: [string, any]) => (
                    <span key={platform}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${data.submitted ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-gray-800 border-gray-700 text-gray-500"}`}>
                      {PLATFORM_EMOJI[platform]} {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Cards — expanded */}
              {isExpanded && contentDay && (
                <div className="border-t border-gray-800 px-5 py-5">

                  {/* Central Idea Banner */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Today's Angle</p>
                    <p className="text-white font-semibold">{contentDay.cards?.[0]?.central_idea}</p>
                    <p className="text-xs text-gray-400 mt-1">Source: {contentDay.cards?.[0]?.news_source}</p>
                  </div>

                  {/* Platform Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {contentDay.cards?.map((card: any, i: number) => {
                      const cardKey = `${brand.brand_slug}-${card.platform}`;
                      const isCardExpanded = expandedCard === cardKey;

                      return (
                        <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{PLATFORM_EMOJI[card.platform]}</span>
                              <span className="font-semibold text-white text-sm capitalize">{card.platform}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLOR[card.type] || "bg-gray-700 text-gray-400"}`}>
                                {card.type}
                              </span>
                              <span className="text-xs text-gray-400">⏰ {card.posting_time}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Hook</p>
                              <p className="text-sm text-blue-300 italic">"{card.hook}"</p>
                            </div>

                            {/* Slides for carousel */}
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
                                      <span className="text-gray-500">{idx + 1}.</span> {isCardExpanded ? t : t.slice(0, 80) + (t.length > 80 ? "..." : "")}
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

                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {card.hashtags?.slice(0, isCardExpanded ? 10 : 3).map((h: string) => (
                                <span key={h} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{h}</span>
                              ))}
                              {!isCardExpanded && card.hashtags?.length > 3 && (
                                <span className="text-xs text-gray-500">+{card.hashtags.length - 3} more</span>
                              )}
                            </div>

                            {/* Expand/Collapse per card */}
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

                  {/* Submit Links shortcut */}
                  <div className="mt-4 flex justify-end">
                    <a href="/creator/links"
                      className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
                      Submit post links for {brand.brand_name} →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
