"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Pixel font — 5×5 bitmaps ────────────────────────────────────────────────
const CHAR = {
  4: [
    [1, 0, 1, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  0: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

function buildPixels(PS, GAP) {
  const chars = [CHAR[4], CHAR[0], CHAR[4]];
  const CH = 5, CW = 5;
  const colGap = 3; // extra columns of gap between chars
  const pixels = [];
  let ox = 0;
  chars.forEach((ch, ci) => {
    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        if (ch[r][c]) {
          pixels.push({
            gx: (ox + c) * (PS + GAP),
            gy: r * (PS + GAP),
            col: ci,
          });
        }
      }
    }
    ox += CW + colGap;
  });
  return pixels;
}

// ─── Canvas hook — fullscreen with pixelated explosion ───────────────────────
function useCanvas(canvasRef, accent) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── size canvas to full window ─────────────────────────────────────────
    const DPR = window.devicePixelRatio || 1;
    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener("resize", resize);

    const cx = () => W / 2;
    const cy = () => H / 2 - H * 0.08;

    // ── pixel grid — scaled so "404" sits centred ──────────────────────────
    const PS = Math.max(10, Math.floor(W / 48));
    const GAP = Math.max(3, Math.floor(PS / 3));
    const pixels = buildPixels(PS, GAP);

    const maxGx = Math.max(...pixels.map(p => p.gx)) + PS;
    const maxGy = Math.max(...pixels.map(p => p.gy)) + PS;

    function offX() { return cx() - maxGx / 2; }
    function offY() { return cy() - maxGy / 2; }

    // ── shard pool for explosion (big pixelated blocks) ────────────────────
    const SHARD_COUNT = 320;
    const shards = Array.from({ length: SHARD_COUNT }, (_, i) => {
      const ang = (i / SHARD_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spd = 4 + Math.random() * 18;
      // pixelated: random square sizes, snapped to a grid
      const sz = (Math.floor(Math.random() * 5) + 1) * Math.max(4, PS / 3);
      return {
        x: 0, y: 0,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - Math.random() * 6,
        gravity: 0.22 + Math.random() * 0.18,
        sz,
        alpha: 0.9 + Math.random() * 0.1,
        fade: 0.008 + Math.random() * 0.012,
        // colour: mix accent with white/dim variants
        bright: Math.random() > 0.6,
      };
    });

    // ── pixel particles for 404 assembly ──────────────────────────────────
    const parts = pixels.map((p, i) => ({
      tx: 0, ty: 0, // set in draw (depends on window size)
      x: 0, y: 0,
      alpha: 0, scale: 0,
      col: p.col,
      gx: p.gx, gy: p.gy,
      delay: i * 5,
      floatAmp: 1 + Math.random() * 2,
      floatFreq: 0.5 + Math.random() * 0.4,
      floatPhase: Math.random() * Math.PI * 2,
    }));

    // ── blob helpers ───────────────────────────────────────────────────────
    function blobR(ang, t) {
      return (
        60 +
        Math.sin(ang * 3 + t) * 14 +
        Math.sin(ang * 5 - t * 0.7) * 8 +
        Math.sin(ang * 7 + t * 1.4) * 5 +
        Math.cos(ang * 2 - t * 0.5) * 10
      );
    }

    function tracePath(t, scale = 1) {
      ctx.beginPath();
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const r = blobR(a, t) * scale;
        const x = cx() + Math.cos(a) * r;
        const y = cy() + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function drawBlob(t, scale, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;

      // multi-layer glow
      for (let l = 4; l >= 0; l--) {
        const expand = l * 18;
        const a = 0.055 - l * 0.009;
        const maxR = 60 * scale + expand + 40;
        const grd = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), maxR);
        grd.addColorStop(0, accent + Math.round(a * 2 * 255).toString(16).padStart(2, "0"));
        grd.addColorStop(0.5, accent + Math.round(a * 255).toString(16).padStart(2, "0"));
        grd.addColorStop(1, accent + "00");
        ctx.beginPath();
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          const r = blobR(ang, t) * scale + expand;
          ctx.lineTo(cx() + Math.cos(ang) * r, cy() + Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // solid body
      tracePath(t, scale);
      const bg2 = ctx.createRadialGradient(cx() - 20, cy() - 20, 5, cx(), cy(), 80 * scale);
      bg2.addColorStop(0, accent + "ee");
      bg2.addColorStop(0.6, accent + "bb");
      bg2.addColorStop(1, accent + "44");
      ctx.fillStyle = bg2;
      ctx.fill();

      // specular
      ctx.beginPath();
      ctx.ellipse(cx() - 18 * scale, cy() - 18 * scale, 18 * scale, 11 * scale, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fill();

      ctx.restore();
    }

    // ── state machine ──────────────────────────────────────────────────────
    // blob (0–1600ms) → burst (1600–2100ms) → assemble (2100–…) → idle
    let phase = "blob";
    let startTime = null;
    let blobT = 0;
    let assembleStart = 0;
    let assembled = false;
    let raf;

    function spawnShards() {
      shards.forEach(s => {
        s.x = cx();
        s.y = cy();
        s.alpha = 0.9 + Math.random() * 0.1;
      });
    }

    function drawShard(s) {
      if (s.alpha <= 0) return;
      // pixelate: snap position to grid
      const px = Math.round(s.x / 4) * 4;
      const py = Math.round(s.y / 4) * 4;

      ctx.save();
      ctx.globalAlpha = s.alpha;
      // glow halo
      const grd = ctx.createRadialGradient(px, py, 0, px, py, s.sz * 1.8);
      grd.addColorStop(0, accent + "66");
      grd.addColorStop(1, accent + "00");
      ctx.fillStyle = grd;
      ctx.fillRect(px - s.sz * 2, py - s.sz * 2, s.sz * 4, s.sz * 4);
      // hard pixel
      ctx.fillStyle = s.bright ? "#ffffff" : accent;
      ctx.fillRect(px - s.sz / 2, py - s.sz / 2, s.sz, s.sz);
      ctx.restore();
    }

    function drawPixelPart(p, t) {
      if (p.alpha <= 0) return;
      const px = p.x + Math.sin(t * p.floatFreq + p.floatPhase) * p.floatAmp;
      const py = p.y + Math.cos(t * p.floatFreq * 0.7 + p.floatPhase) * p.floatAmp * 0.6;
      const s = PS * p.scale;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      // glow
      const grd = ctx.createRadialGradient(px, py, 0, px, py, s * 1.5);
      grd.addColorStop(0, accent + "88");
      grd.addColorStop(1, accent + "00");
      ctx.fillStyle = grd;
      ctx.fillRect(px - s * 1.5, py - s * 1.5, s * 3, s * 3);
      // pixel body (snapped for pixelated look)
      const sx = Math.round((px - s / 2) / 1) * 1;
      const sy = Math.round((py - s / 2) / 1) * 1;
      ctx.fillStyle = accent;
      ctx.fillRect(sx, sy, Math.ceil(s), Math.ceil(s));
      // top-left shine
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(sx, sy, Math.ceil(s * 0.4), Math.ceil(s * 0.4));
      ctx.restore();
    }

    // ── scanline/noise overlay ─────────────────────────────────────────────
    function drawScanlines(t) {
      ctx.save();
      ctx.globalAlpha = 0.014;
      for (let y = 0; y < H; y += 2) {
        const v = Math.sin(y * 0.08 + t * 0.4) * 0.5 + 0.5;
        ctx.fillStyle = v > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();
    }

    // ── shockwave ring ─────────────────────────────────────────────────────
    function drawShockwave(r, alpha) {
      if (alpha <= 0 || r <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx(), cy(), r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.35;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx(), cy(), r * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      // second outer ring
      ctx.globalAlpha = alpha * 0.18;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx(), cy(), r * 1.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── main render loop ───────────────────────────────────────────────────
    function tick(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const t = elapsed / 1000;

      ctx.clearRect(0, 0, W, H);

      // dot-grid bg (drawn on canvas for consistent look)
      ctx.save();
      ctx.globalAlpha = 0.08;
      const step = 32;
      ctx.fillStyle = "rgba(128,128,128,0.6)";
      for (let gx = 0; gx < W; gx += step) {
        for (let gy = 0; gy < H; gy += step) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }
      ctx.restore();

      blobT = t * 1.5;

      // ── blob ─────────────────────────────────────────────────────────────
      if (phase === "blob") {
        drawBlob(blobT, 1, 1);
        if (elapsed >= 1600) {
          phase = "burst";
          spawnShards();
          // initialise particle start positions (scatter from blob)
          parts.forEach(p => {
            const ang = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            p.x = cx() + Math.cos(ang) * dist;
            p.y = cy() + Math.sin(ang) * dist;
            p.alpha = 0;
            p.scale = 0;
          });
        }
      }

      // ── burst ─────────────────────────────────────────────────────────────
      if (phase === "burst") {
        const bp = elapsed - 1600;

        // blob scales up & fades
        const bScale = 1 + (bp / 250) * 3;
        const bAlpha = Math.max(0, 1 - bp / 250);
        if (bAlpha > 0) drawBlob(blobT, bScale, bAlpha);

        // shockwave expands full-screen
        const swR = (bp / 500) * (Math.max(W, H) * 0.85);
        const swA = Math.max(0, 1 - bp / 500);
        drawShockwave(swR, swA);

        // physics shards — fill entire screen
        shards.forEach(s => {
          s.vx *= 0.985;
          s.vy += s.gravity;
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= s.fade;
          drawShard(s);
        });

        if (bp >= 500) {
          phase = "assemble";
          assembleStart = now;
        }
      }

      // ── assemble ──────────────────────────────────────────────────────────
      if (phase === "assemble" || phase === "idle") {
        const ap = now - assembleStart;

        // keep fading shards during early assemble
        if (phase === "assemble") {
          shards.forEach(s => {
            s.vx *= 0.985;
            s.vy += s.gravity;
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.fade * 2;
            if (s.alpha > 0) drawShard(s);
          });
        }

        parts.forEach(p => {
          // recalculate target each frame (handles resize)
          p.tx = offX() + p.gx;
          p.ty = offY() + p.gy;

          if (phase === "idle") {
            p.x = p.tx; p.y = p.ty;
            p.alpha = 1; p.scale = 1;
            drawPixelPart(p, t);
            return;
          }

          const pElapsed = ap - p.delay;
          if (pElapsed < 0) { drawPixelPart(p, t); return; }

          const dur = 500;
          const prog = Math.min(1, pElapsed / dur);
          const ease = 1 - Math.pow(1 - prog, 3);

          p.x = p.x + (p.tx - p.x) * ease * 0.15;
          p.y = p.y + (p.ty - p.y) * ease * 0.15;
          p.alpha = Math.min(1, prog * 1.6);
          p.scale = 0.4 + ease * 0.6;
          drawPixelPart(p, t);
        });

        if (!assembled) {
          const maxDelay = parts[parts.length - 1]?.delay ?? 0;
          if (ap > maxDelay + 700) {
            assembled = true;
            phase = "idle";
          }
        }
      }

      drawScanlines(t);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent]);
}

// ─── Glitch text reveal ───────────────────────────────────────────────────────
const CHARS = "!@#$%^&*<>?/\\|0123456789ABCDEF";

function GlitchText({ text, delay = 0 }) {
  const [display, setDisplay] = useState(() => text.replace(/\S/g, "█"));

  useEffect(() => {
    const id = setTimeout(() => {
      let iter = 0;
      const iv = setInterval(() => {
        setDisplay(
          text.split("").map((ch, i) => {
            if (ch === " ") return " ";
            if (i < iter) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        iter += 1.2;
        if (iter >= text.length) { setDisplay(text); clearInterval(iv); }
      }, 18);
    }, delay);
    return () => clearTimeout(id);
  }, [text, delay]);

  return <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>{display}</span>;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function NotFound() {
  const canvasRef = useRef(null);
  const [showText, setShowText] = useState(false);

  // Read accent from CSS var once on mount (no setState in effect)
  const [accent] = useState(() => {
    if (typeof window === "undefined") return "#8b5cf6";
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--app-green")
        .trim() || "#8b5cf6"
    );
  });

  useEffect(() => {
    // blob 1.6s + burst 0.5s + max particle delay ~1.5s + buffer
    const t = setTimeout(() => setShowText(true), 3400);
    return () => clearTimeout(t);
  }, []);

  useCanvas(canvasRef, accent);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--background)",
      overflow: "hidden",
      fontFamily: "var(--font-sans, sans-serif)",
    }}>
      {/* Fullscreen canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Radial vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 65% 55% at 50% 44%, transparent 30%, var(--background) 100%)",
        pointerEvents: "none",
      }} />

      {/* Text — centred below the 404, positioned in lower half */}
      <div style={{
        position: "absolute",
        bottom: "clamp(60px, 18vh, 140px)",
        left: 0, right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        zIndex: 10,
      }}>
        {/* Error chip */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 12px",
          borderRadius: "999px",
          border: "1px solid color-mix(in srgb, var(--app-green) 35%, transparent)",
          background: "color-mix(in srgb, var(--app-green) 8%, transparent)",
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "var(--app-green)",
            boxShadow: "0 0 6px var(--app-green)",
            display: "inline-block",
          }} />
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--app-green)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}>Error 404</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
          fontWeight: 700,
          color: "var(--foreground)",
          margin: 0,
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s",
        }}>
          {showText && <GlitchText text="Page not found" delay={40} />}
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
          color: "var(--muted-foreground)",
          margin: 0,
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.25s ease 0.1s, transform 0.25s ease 0.1s",
        }}>
          {showText && <GlitchText text="The blob absorbed this route." delay={160} />}
        </p>

        {/* CTA */}
        <div style={{
          marginTop: "0.75rem",
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.25s ease 0.18s, transform 0.25s ease 0.18s",
        }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.55rem 1.3rem",
              borderRadius: "var(--radius, 0.5rem)",
              background: "var(--app-green)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 0 20px color-mix(in srgb, var(--app-green) 40%, transparent)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 28px color-mix(in srgb, var(--app-green) 60%, transparent)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 20px color-mix(in srgb, var(--app-green) 40%, transparent)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.83 7.17a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06L5.81 8H13a.75.75 0 0 0 0-1.5H5.81l3.58-3.58A.75.75 0 0 0 8.33 1.84l-4.5 4.5-.01-.01v.84z" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
