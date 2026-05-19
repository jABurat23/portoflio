"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { projects, Project } from "@/data/projects";

const statusColor: Record<string, string> = {
  building: "#2a5c3f",
  complete: "#c8a96e",
  archived: "#2e2e40",
};

// ── Featured card (large) ─────────────────────────────────────────────────────
function FeaturedCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.div
      key={project.id}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "grid",
        gridTemplateColumns: project.screenshot ? "1fr 1fr" : "1fr",
        border: "1px solid var(--border)",
        background: "var(--bg-2)",
        marginBottom: "1px",
        minHeight: "320px",
        overflow: "hidden",
      }}
    >
      {/* left: info */}
      <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)" }}>
              {String(index + 1).padStart(2, "0")} · featured
            </span>
            <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: statusColor[project.status] }}>
              {project.status}
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            lineHeight: 1.2,
            marginBottom: "1rem",
          }}>
            {project.name}
          </h2>

          <p style={{
            fontSize: "13px",
            lineHeight: 1.8,
            color: "var(--text-2)",
            fontFamily: "var(--sans)",
            fontStyle: "italic",
            fontWeight: 300,
            maxWidth: "380px",
            marginBottom: "1.5rem",
          }}>
            {project.description}
          </p>

          {project.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {project.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  border: "1px solid var(--border)",
                  color: "var(--text-3)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "8px 18px",
                border: "1px solid var(--accent-dim)",
                color: "var(--accent)",
                textDecoration: "none",
                transition: "background 0.15s",
                fontFamily: "var(--mono)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              repo ↗
            </a>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "8px 18px",
                border: "1px solid var(--border)",
                color: "var(--text-3)",
                textDecoration: "none",
                transition: "all 0.15s",
                fontFamily: "var(--mono)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-3)";
              }}
            >
              live ↗
            </a>
          )}
        </div>
      </div>

      {/* right: screenshot */}
      {project.screenshot && (
        <div style={{ position: "relative", borderLeft: "1px solid var(--border)", overflow: "hidden", minHeight: "280px" }}>
          <Image
            src={project.screenshot}
            alt={project.name}
            fill
            sizes="280px"
            style={{ objectFit: "cover", objectPosition: "top", filter: "brightness(0.85)" }}
          />
          {/* overlay gradient */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(15,15,20,0.4), transparent)",
          }} />
        </div>
      )}

      {/* no screenshot placeholder */}
      {!project.screenshot && (
        <div />
      )}
    </motion.div>
  );
}

// ── Small grid card ───────────────────────────────────────────────────────────
function GridCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)",
        background: hovered ? "var(--bg-2)" : "var(--bg)",
        padding: "1.5rem",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        borderColor: hovered ? "var(--border-hover, #252535)" : "var(--border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "160px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* screenshot bg if available */}
      {project.screenshot && (
        <div style={{ position: "absolute", inset: 0, opacity: hovered ? 0.08 : 0.04, transition: "opacity 0.2s" }}>
          <Image
            src={project.screenshot}
            alt={project.name}
            fill
            sizes="280px"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: statusColor[project.status] }}>
            {project.status}
          </span>
        </div>

        <h3 style={{
          fontSize: "13px",
          fontWeight: 300,
          letterSpacing: "0.01em",
          color: hovered ? "var(--accent)" : "var(--text)",
          transition: "color 0.15s",
          marginBottom: "0.5rem",
          lineHeight: 1.3,
        }}>
          {project.name}
        </h3>

        <p style={{
          fontSize: "11px",
          color: "var(--text-2)",
          fontFamily: "var(--sans)",
          fontStyle: "italic",
          fontWeight: 300,
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {project.description}
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {project.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontSize: "8px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "2px 6px",
              border: "1px solid var(--border)",
              color: "var(--text-3)",
            }}>
              {tag}
            </span>
          ))}
        </div>
        <span style={{
          fontSize: "10px",
          color: hovered ? "var(--accent)" : "var(--text-3)",
          transition: "color 0.15s",
        }}>
          ↑ feature
        </span>
      </div>
    </motion.div>
  );
}

// ── Main Projects section ─────────────────────────────────────────────────────
export default function Projects() {
  const [featuredId, setFeaturedId] = useState(projects[0]?.id ?? "");

  const featured = projects.find((p) => p.id === featuredId) ?? projects[0];
  const featuredIndex = projects.findIndex((p) => p.id === featuredId);
  const grid = projects.filter((p) => p.id !== featuredId);

  const promote = (id: string) => {
    setFeaturedId(id);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      style={{ marginBottom: "7rem" }}
    >
      {/* section header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "0.75rem",
        marginBottom: "0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)" }}>
            projects
          </span>
          <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-3)" }}>
            / {projects.length} total
          </span>
        </div>
        <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--text-3)", textTransform: "uppercase" }}>
          click to feature ↑
        </span>
      </div>

      {/* featured */}
      <AnimatePresence mode="wait">
        <FeaturedCard key={featured.id} project={featured} index={featuredIndex} />
      </AnimatePresence>

      {/* grid */}
      {grid.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1px",
          background: "var(--border)",
        }}>
          {grid.map((project, i) => (
            <GridCard
              key={project.id}
              project={project}
              index={projects.findIndex((p) => p.id === project.id)}
              onClick={() => promote(project.id)}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}