import { NextResponse } from "next/server";

let cache: {
  data: { msg: string; time: string; repo: string }[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes — commits change more often than languages
const GITHUB_USER = "jABurat23";

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`,
      { headers: { "Accept": "application/vnd.github+json" } }
    );
    const events = await res.json();

    const pushEvents = events.filter(
      (e: { type: string }) => e.type === "PushEvent"
    );

    const recent: { msg: string; time: string; repo: string }[] = [];

    for (const event of pushEvents) {
      if (recent.length >= 4) break;
      const commits = event.payload?.commits ?? [];
      for (const commit of [...commits].reverse()) {
        if (recent.length >= 4) break;
        const msg = commit.message?.split("\n")[0] ?? "";
        const repo = event.repo?.name?.split("/")[1] ?? "";
        const time = timeAgo(new Date(event.created_at));
        recent.push({ msg, time, repo });
      }
    }

    const result = recent.length ? recent : [
      { msg: "feat: boot screen animation", time: "2h ago", repo: "winrt" },
      { msg: "fix: tauri command namespace", time: "1d ago", repo: "winrt" },
      { msg: "chore: phase 2 merged", time: "3d ago", repo: "winrt" },
    ];

    cache = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([
      { msg: "feat: boot screen animation", time: "2h ago", repo: "winrt" },
      { msg: "fix: tauri command namespace", time: "1d ago", repo: "winrt" },
      { msg: "chore: phase 2 merged", time: "3d ago", repo: "winrt" },
    ]);
  }
}