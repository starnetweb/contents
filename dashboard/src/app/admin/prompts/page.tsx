"use client";
import { useEffect, useState } from "react";
import { getBrands, getBrandPrompt, updateBrandPrompt } from "@/lib/api";

const PLACEHOLDER = `Examples of what you can add here:
- Always end Instagram captions with a question to boost comments
- Focus content on final-year students, not just general students
- Avoid mentioning competitor brands
- Always include a price or discount mention when possible
- Use more Pidgin English to sound relatable
- Content should always tie back to the website URL`;

export default function PromptsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBrands().then((r) => {
      setBrands(r.data);
      if (r.data.length > 0) selectBrand(r.data[0].id);
    });
  }, []);

  const selectBrand = async (id: string) => {
    setActiveId(id);
    setMsg("");
    setLoading(true);
    try {
      const r = await getBrandPrompt(id);
      setPrompt(r.data.custom_prompt || "");
      setOriginal(r.data.custom_prompt || "");
    } catch {
      setPrompt(""); setOriginal("");
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateBrandPrompt(activeId, prompt);
      setOriginal(prompt);
      setMsg("✅ Saved");
    } catch {
      setMsg("❌ Error saving");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const activeBrand = brands.find((b) => b.id === activeId);
  const isDirty = prompt !== original;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Prompts</h1>
        <p className="text-gray-400 text-sm mt-1">
          Add custom instructions per brand. These are injected into the AI prompt every time content is generated for that brand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Brand list */}
        <div className="lg:col-span-1 space-y-1">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => selectBrand(b.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeId === b.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
              }`}
            >
              <div>{b.name}</div>
              <div className={`text-xs mt-0.5 ${activeId === b.id ? "text-blue-200" : "text-gray-600"}`}>
                {b.slug}
              </div>
            </button>
          ))}
        </div>

        {/* Prompt editor */}
        <div className="lg:col-span-3">
          {activeBrand && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">{activeBrand.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeBrand.slug === "examkits"
                      ? "Strategy: News-based — searches last-24h news for content ideas"
                      : "Strategy: Evergreen — AI generates fresh ideas without news search"}
                  </p>
                </div>
                {isDirty && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Additional instructions for this brand
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    These instructions are added to the AI prompt on top of the standard content strategy. Leave blank to use the default prompt only.
                  </p>
                  {loading ? (
                    <div className="h-48 bg-gray-800 rounded-xl animate-pulse" />
                  ) : (
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={12}
                      placeholder={PLACEHOLDER}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {msg && <span className="text-sm text-gray-300">{msg}</span>}
                    {!msg && prompt && (
                      <button
                        onClick={() => { setPrompt(""); }}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Clear prompt
                      </button>
                    )}
                  </div>
                  <button
                    onClick={save}
                    disabled={saving || !isDirty}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {saving ? "Saving..." : "Save Prompt"}
                  </button>
                </div>
              </div>

              {/* Info box */}
              <div className="mx-6 mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">💡 What you can control with custom prompts:</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Tone adjustments (more casual, more formal, more Pidgin)</li>
                  <li>Content restrictions (topics to avoid)</li>
                  <li>Mandatory CTAs or links to include</li>
                  <li>Audience focus (e.g. only final-year students)</li>
                  <li>Posting style preferences (always use hooks, always end with a question)</li>
                  <li>Brand-specific offers or seasonal promotions to highlight</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
