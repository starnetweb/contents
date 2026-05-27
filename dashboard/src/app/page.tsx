"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const role = Cookies.get("role");
    if (!role) router.push("/login");
    else router.push(role === "admin" ? "/admin" : "/creator");
  }, []);
  return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Redirecting...</div>;
}
