"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CRT() {
  const scanRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanRef.current) {
      gsap.fromTo(
        scanRef.current,
        { top: "-10%" },
        { top: "110%", duration: 8, ease: "none", repeat: -1 }
      );
    }

    const glitch = () => {
      if (!glitchRef.current) return;
      const delay = Math.random() * 8 + 2;
      gsap.delayedCall(delay, () => {
        gsap.to(glitchRef.current, {
          opacity: Math.random() * 0.05 + 0.01,
          duration: 0.05,
          yoyo: true,
          repeat: Math.floor(Math.random() * 3 + 1),
          onComplete: glitch,
        });
      });
    };
    glitch();
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none" }}>
      {/* scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          backgroundSize: "100% 4px",
        }}
      />
      {/* moving glow */}
      <div
        ref={scanRef}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: "4rem",
          background: "linear-gradient(to bottom, transparent, rgba(200,169,110,0.025), transparent)",
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      {/* glitch */}
      <div
        ref={glitchRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          background: "rgba(200,169,110,0.02)",
        }}
      />
    </div>
  );
}
