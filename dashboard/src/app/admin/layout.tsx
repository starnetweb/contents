"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

const navItems = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/content", label: "Content", icon: "✍️" },
  { href: "/admin/scores", label: "Scores", icon: "🏆" },
  { href: "/admin/brands", label: "Brands", icon: "🏢" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const role = Cookies.get("role");
    if (!role) router.push("/login");
    else if (role !== "admin") router.push("/creator");
    setUserName(Cookies.get("name") || "Admin");
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    Cookies.remove("token"); Cookies.remove("role"); Cookies.remove("name");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-30
        transform transition-transform duration-250 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-white">🚀 Content Agent</div>
            <div className="text-xs text-blue-400 mt-1 font-medium uppercase tracking-wider">Admin</div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-3 px-1">
            Signed in as <span className="text-white font-medium" suppressHydrationWarning>{userName}</span>
          </div>
          <button onClick={logout}
            className="w-full text-sm text-gray-400 hover:text-red-400 text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — mobile only */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-semibold text-sm">
            {navItems.find((n) => pathname.startsWith(n.href) && n.href !== "/admin")?.label ||
             "Overview"}
          </span>
          <div className="w-9" /> {/* spacer */}
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
