"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export default function AccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/auth/access/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired access link");
        return r.json();
      })
      .then((data) => {
        Cookies.set("token", data.access_token, { expires: 7 });
        Cookies.set("role", data.role, { expires: 7 });
        Cookies.set("name", data.name, { expires: 7 });
        router.replace(data.role === "admin" ? "/admin" : "/creator");
      })
      .catch((e) => {
        setErrorMsg(e.message || "Access link not valid");
        setStatus("error");
      });
  }, [slug]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-800">
        <div className="text-4xl mb-4">🔗</div>
        <h1 className="text-xl font-bold text-white mb-2">Link Not Valid</h1>
        <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
        <p className="text-gray-500 text-xs">
          Contact your administrator for a new access link.
        </p>
      </div>
    </div>
  );
}
