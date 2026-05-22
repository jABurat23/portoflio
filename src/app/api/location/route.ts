import { NextResponse } from "next/server";

let cache: { data: object; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      latitude: 7.0707,
      longitude: 125.6087,
      city: "Cebu City",
      country_name: "PH",
      timezone: "Asia/Manila",
    });
  }
}