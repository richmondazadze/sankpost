"use client";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Clock, Instagram, Linkedin, Twitter, ChevronLeft } from "lucide-react";
import { getGeneratedContentHistory } from "../../utils/db/actions";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      const h = await getGeneratedContentHistory(user.id, 50);
      setHistory(h);
      setLoading(false);
    };
    run();
  }, [user]);

  const filtered = useMemo(() => {
    return (history || [])
      .filter((it) => (filter === "all" ? true : it.contentType === filter))
      .filter((it) => (query ? (it.prompt || "").toLowerCase().includes(query.toLowerCase()) : true));
  }, [history, filter, query]);

  const iconFor = (type) =>
    type === "twitter" ? (
      <Twitter className="h-4 w-4 text-blue-400" />
    ) : type === "instagram" ? (
      <Instagram className="h-4 w-4 text-pink-400" />
    ) : (
      <Linkedin className="h-4 w-4 text-blue-600" />
    );

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-950 min-h-screen text-white">
      <Navbar />
      {/* Spacer equal to navbar height */}
      <div className="h-16 md:h-20" aria-hidden />
      <div className="mx-auto mb-8 pt-4 grid max-w-[1400px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[auto_1fr] lg:px-8">
        <Sidebar />
        <main className="space-y-6">
          <div className="sticky top-20 z-20 bg-gradient-to-b from-gray-900 via-black/90 to-transparent pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.history.length > 1) router.back(); else router.push("/generate");
                  }}
                  className="sm:hidden p-2 rounded-md border border-gray-700/60 bg-gray-800/60 text-gray-300 hover:bg-gray-800/80"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">History</h1>
              <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-56 rounded-md border border-gray-700/60 bg-gray-900/50 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {["all", "twitter", "instagram", "linkedin"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs border transition-colors ${
                  filter === f
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-200"
                    : "border-gray-700/50 bg-gray-800/30 text-gray-300 hover:bg-gray-800/60"
                }`}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <section className="grid grid-cols-1 gap-3">
            {loading && (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-800/50" />
                ))}
              </div>
            )}
            {!loading && filtered.map((item) => (
              <article
                key={item.id}
                className="group rounded-xl border border-gray-700/40 bg-gray-800/40 p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => {
                  setSelected(item);
                  setOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-gray-700/50">
                      {iconFor(item.contentType)}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{item.contentType}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.prompt}</p>
              </article>
            ))}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-gray-400">No results</p>
            )}
          </section>
        </main>
      </div>

      {open && selected && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-gray-700/60 bg-gray-900/95 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {iconFor(selected.contentType)}
                  <h3 className="text-lg font-semibold text-gray-100">Details • {selected.contentType}</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="px-2 py-1 text-sm rounded-md border border-gray-700/50 text-gray-300 hover:bg-white/5"
                  aria-label="Close details"
                >
                  Close
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Prompt</p>
                  <div className="rounded-md border border-gray-700/60 bg-gray-800/60 p-3 text-sm text-gray-200 whitespace-pre-wrap">{selected.prompt}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Generated</p>
                    <button
                      className="px-2 py-1 text-xs rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                      onClick={() => navigator.clipboard.writeText(selected.content)}
                    >
                      Copy All
                    </button>
                  </div>
                  {selected.contentType === "twitter" ? (
                    <div className="space-y-3 max-h-[50vh] overflow-auto">
                      {(() => {
                        const extractTweets = (raw) => {
                          try {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) {
                              return parsed.map((t) => String(t).trim()).filter(Boolean);
                            }
                          } catch (_) {}
                          const parts = String(raw)
                            .split(/TWEET\d+:\s*/i)
                            .map((t) => t.trim())
                            .filter(Boolean);
                          return parts.length ? parts : [String(raw)];
                        };
                        const tweets = extractTweets(selected.content);
                        return tweets.map((t, idx) => (
                          <div key={idx} className="rounded-md border border-gray-700/60 bg-gray-800/60 p-3 text-sm text-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400">Tweet {idx + 1}</span>
                              <button
                                className="px-2 py-0.5 text-xs rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                                onClick={() => navigator.clipboard.writeText(t)}
                              >
                                Copy
                              </button>
                            </div>
                            <div className="whitespace-pre-wrap">{t}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-700/60 bg-gray-800/60 p-3 text-sm text-gray-200 whitespace-pre-wrap max-h-[50vh] overflow-auto">
                      {selected.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

