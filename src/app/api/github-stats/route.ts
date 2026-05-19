import { NextResponse } from "next/server";

// in-memory cache — persists across requests in the same server instance
let cache: {
  data: { name: string; level: number }[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms
const GITHUB_USER = "jABurat23";

export async function GET() {
  // return cached data if still fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // fetch all repos
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`,
      { headers: { "Accept": "application/vnd.github+json" } }
    );
    const repos = await reposRes.json();

    // fetch languages for each non-fork repo
    const langMaps = await Promise.all(
      repos
        .filter((r: { fork: boolean }) => !r.fork)
        .map((r: { name: string }) =>
          fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${r.name}/languages`,
            { headers: { "Accept": "application/vnd.github+json" } }
          ).then((res) => res.json())
        )
    );

    // aggregate byte counts
    const totals: Record<string, number> = {};
    langMaps.forEach((map: Record<string, number>) => {
      Object.entries(map).forEach(([lang, bytes]) => {
        totals[lang] = (totals[lang] || 0) + bytes;
      });
    });

    // sort and take top 5
    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = sorted.reduce((s, [, b]) => s + b, 0);
    const result = sorted.map(([name, bytes]) => ({
      name,
      level: Math.round((bytes / total) * 100),
    }));

    // store in cache
    cache = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      [
        { name: "Rust", level: 60 },
        { name: "JavaScript", level: 25 },
        { name: "TypeScript", level: 10 },
        { name: "HTML", level: 5 },
      ],
      { status: 200 }
    );
  }
}