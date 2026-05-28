"use client";
import { useState, useEffect } from "react";
import { generateTelegramLink, getTelegramStatus } from "@/lib/api";

export default function CreatorSettingsPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [linkData, setLinkData] = useState<{ link: string; token: string; instruction: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getTelegramStatus()
      .then((r) => setConnected(r.data.connected))
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async () => {
    setGenerating(true);
    try {
      const r = await generateTelegramLink();
      setLinkData(r.data);
    } catch {
      alert("Failed to generate link. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (linkData) {
      navigator.clipboard.writeText(linkData.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Telegram Connect Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h2 className="text-white font-semibold">Telegram Notifications</h2>
            <p className="text-gray-400 text-sm">Receive content alerts and reminders via Telegram</p>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Checking status...</div>
        ) : connected ? (
          <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-4 py-3">
            <span className="text-green-400 text-lg">✅</span>
            <span className="text-green-300 font-medium">Telegram connected</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg px-4 py-3 text-gray-300 text-sm">
              Connect your Telegram to receive instant notifications when content is ready, reminders to submit post links, and performance updates.
            </div>

            {!linkData ? (
              <button
                onClick={handleConnect}
                disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><span className="animate-spin">⏳</span> Generating link...</>
                ) : (
                  <><span>✈️</span> Connect Telegram</>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 space-y-3">
                  <p className="text-blue-200 text-sm font-medium">📋 How to connect:</p>
                  <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                    <li>Click the link below to open Telegram</li>
                    <li>Press <strong>Start</strong> in the chat</li>
                    <li>You'll get a confirmation message</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <a
                    href={linkData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors text-center text-sm"
                  >
                    🔗 Open in Telegram
                  </a>
                  <button
                    onClick={handleCopy}
                    className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    {copied ? "✅ Copied" : "📋 Copy"}
                  </button>
                </div>

                <p className="text-gray-500 text-xs text-center">
                  Link expires after use. Refresh page to check connection status.
                </p>

                <button
                  onClick={() => { setLinkData(null); getTelegramStatus().then(r => setConnected(r.data.connected)); }}
                  className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                >
                  ↻ Check connection status
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
