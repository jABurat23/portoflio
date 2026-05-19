"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CRT from "@/components/CRT";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import BootScreen from "@/components/BootScreen";
import Skeleton from "@/components/Skeleton";
import MobileLayout from "@/components/MobileLayout";
import About from "@/components/About";

type Stage = "boot" | "skeleton" | "ready";
const SKELETON_THRESHOLD_MS = 6000; // Show skeleton if boot takes longer than this - 6s = 6000ms | 1000ms = 1s

export default function Home() {
  const [stage, setStage] = useState<Stage>("boot");
  const [isMobile, setIsMobile] = useState(false);
  const bootStartRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now()
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleBootComplete = () => {
    const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - bootStartRef.current;
    if (elapsed > SKELETON_THRESHOLD_MS) {
      setStage("skeleton");
      setTimeout(() => setStage("ready"), 1400);
    } else {
      setStage("ready");
    }
  };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden", transition: "background 0.3s ease" }}>
      <CRT />

      <AnimatePresence>
        {stage === "boot" && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === "skeleton" && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ position: "relative", zIndex: 10, width: "100%", boxSizing: "border-box", padding: "3rem clamp(1.5rem, 6vw, 8rem) 0" }}>
            <Skeleton />
          </motion.div>
        )}

        {stage === "ready" && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ position: "relative", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
            {isMobile ? (
              <MobileLayout />
            ) : (
              <div style={{ padding: "3rem clamp(1.5rem, 6vw, 8rem) 0" }}>
                <Hero />
                <About />
                <div id="projects"><Projects /></div>
                <Footer />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}