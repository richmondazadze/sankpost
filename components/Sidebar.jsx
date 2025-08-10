"use client";
import Link from "next/link";
import { useState } from "react";
import { Home, Sparkles, Clock, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const item = (href, label, Icon) => (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon className="h-4 w-4 text-gray-400 group-hover:text-white" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-gray-800/50 bg-gray-900/40 backdrop-blur-sm transition-all duration-200 sticky top-20 h-[calc(100vh-5rem)] ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800/50">
        {!collapsed && (
          <span className="text-sm font-semibold text-gray-200">Dashboard</span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-hidden">
        {item("/", "Home", Home)}
        {item("/generate", "Generate", Sparkles)}
        {item("/history", "History", Clock)}
      </nav>

      {/* Quick Tip removed */}
    </aside>
  );
}

