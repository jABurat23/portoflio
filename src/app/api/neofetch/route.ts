import { NextResponse } from "next/server";

let cache: { data: Record<string, string>; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;
const GITHUB_USER = "jABurat23";

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, {
        headers: { "Accept": "application/vnd.github+json" },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`, {
        headers: { "Accept": "application/vnd.github+json" },
      }),
    ]);

    const user = await userRes.json();
    const repos = await reposRes.json();

    const publicRepos = repos.filter((r: { fork: boolean }) => !r.fork).length;
    const totalStars = repos.reduce((s: number, r: { stargazers_count: number }) => s + r.stargazers_count, 0);

    const data: Record<string, string> = {
      user:     `${GITHUB_USER}@personal.archive`,
      os:       "windows 11",
      host:     "personal.archive v1",
      shell:    "archive.terminal",
      location: "cebu city, ph · 7°04′N 125°36′E",
      stack:    "rust · tauri · next.js · typescript",
      focus:    "systems builder · desktop tooling",
      github:   `github.com/${GITHUB_USER}`,
      repos:    String(publicRepos),
      stars:    String(totalStars),
      status:   user.bio ?? "building winrt v3",
      uptime:   "est. 2024",
      site:     "portoflio-taupe-eight.vercel.app",
    };

    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      user:     `${GITHUB_USER}@personal.archive`,
      os:       "windows 11",
      host:     "personal.archive v1",
      shell:    "archive.terminal",
      location: "cebu city, ph · 7°04′N 125°36′E",
      stack:    "rust · tauri · next.js · typescript",
      focus:    "systems builder · desktop tooling",
      github:   `github.com/${GITHUB_USER}`,
      repos:    "—",
      stars:    "—",
      status:   "building winrt v3",
      uptime:   "est. 2024",
      site:     "portoflio-taupe-eight.vercel.app",
    });
  }
}