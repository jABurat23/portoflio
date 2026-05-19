"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

function ShimmerBlock({
  width = "100%",
  height = 12,
  style = {},
}: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0.3, 0.7],
      duration: 1200,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      delay: Math.random() * 400,
    });
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        background: "var(--bg-3)",
        position: "relative",
        overflow: "hidden",
        opacity: 0.3,
        ...style,
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.04) 50%, transparent 100%)",
        animation: "shimmer 2s infinite",
      }} />
    </div>
  );
}

export default function Skeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* hero skeleton */}
      <div style={{ marginBottom: "7rem" }}>
        {/* topbar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.25rem",
          marginBottom: "4rem",
        }}>
          <ShimmerBlock width={200} height={10} />
          <div style={{ display: "flex", gap: "1rem" }}>
            <ShimmerBlock width={60} height={10} />
            <ShimmerBlock width={50} height={24} />
          </div>
        </div>

        {/* hero body */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "4rem" }}>
          {/* left */}
          <div style={{ flex: "0 0 auto", maxWidth: "520px", width: "100%" }}>
            <ShimmerBlock width="70%" height={80} style={{ marginBottom: "1.5rem" }} />
            <ShimmerBlock width="50%" height={10} style={{ marginBottom: "1.75rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "2.5rem" }}>
              <ShimmerBlock width="85%" height={12} />
              <ShimmerBlock width="60%" height={12} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <ShimmerBlock width={100} height={36} />
              <ShimmerBlock width={110} height={36} />
            </div>
          </div>

          {/* right floating cards */}
          <div style={{ flex: 1, position: "relative", height: "420px", minWidth: 0 }}>
            <div style={{ position: "absolute", top: 0, left: 20, transform: "rotate(-3deg)" }}>
              <ShimmerBlock width={210} height={140} />
            </div>
            <div style={{ position: "absolute", top: 30, left: 200, transform: "rotate(2.5deg)" }}>
              <ShimmerBlock width={240} height={110} />
            </div>
            <div style={{ position: "absolute", top: 210, left: 60, transform: "rotate(-1.5deg)" }}>
              <ShimmerBlock width={250} height={130} />
            </div>
            <div style={{ position: "absolute", top: 220, left: 240, transform: "rotate(3deg)" }}>
              <ShimmerBlock width={220} height={140} />
            </div>
          </div>
        </div>

        {/* stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid var(--border)",
          marginTop: "5rem",
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              padding: "2rem 0",
              paddingLeft: i > 0 ? "2.5rem" : 0,
              paddingRight: i < 2 ? "2.5rem" : 0,
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              <ShimmerBlock width={50} height={9} />
              <ShimmerBlock width={80} height={32} />
              <ShimmerBlock width={60} height={10} />
            </div>
          ))}
        </div>
      </div>

      {/* projects skeleton */}
      <div style={{ marginBottom: "7rem" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.75rem",
        }}>
          <ShimmerBlock width={60} height={9} />
          <ShimmerBlock width={50} height={9} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            borderBottom: "1px solid var(--border)",
            padding: "2rem 0",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <ShimmerBlock width={20} height={9} />
                <ShimmerBlock width={180} height={14} />
                <ShimmerBlock width={60} height={9} />
              </div>
              <ShimmerBlock width={50} height={10} />
            </div>
            <ShimmerBlock width="65%" height={12} />
            <ShimmerBlock width="45%" height={12} />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <ShimmerBlock width={50} height={22} />
              <ShimmerBlock width={55} height={22} />
              <ShimmerBlock width={80} height={22} />
            </div>
          </div>
        ))}
      </div>

      {/* footer skeleton */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        borderTop: "1px solid var(--border)",
        paddingTop: "2.5rem",
        paddingBottom: "4rem",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <ShimmerBlock width={80} height={9} />
          <ShimmerBlock width={180} height={12} />
          <ShimmerBlock width={140} height={11} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <ShimmerBlock width={60} height={9} />
          <ShimmerBlock width={60} height={12} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <ShimmerBlock width={60} height={9} />
          <ShimmerBlock width={140} height={12} />
          <ShimmerBlock width={180} height={11} />
        </div>
      </div>
    </>
  );
}