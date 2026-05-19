"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || !window.matchMedia("(pointer: fine)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor]") && ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) scale(1.6)`;
        ringRef.current.style.borderColor = "var(--accent)";
        ringRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) scale(1)`;
        ringRef.current.style.borderColor = "rgba(200,169,110,0.4)";
        ringRef.current.style.opacity = "0.6";
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onEnter);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onEnter);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [isMobile, mouseX, mouseY, dotX, dotY]);

  if (isMobile) return null;

  return (
    <>
      <motion.div ref={ringRef} style={{ position: "fixed", top: springY, left: springX, width: 28, height: 28, border: "1px solid rgba(200,169,110,0.4)", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, translateX: "-50%", translateY: "-50%", opacity: 0.6, transition: "transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease" }} />
      <motion.div style={{ position: "fixed", top: dotY, left: dotX, width: 4, height: 4, background: "var(--accent)", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, translateX: "-50%", translateY: "-50%" }} />
    </>
  );
}