"use client";

import { useEffect, useRef } from "react";

/**
 * DotWaves — Sharma-style dotted particle waves behind the hero portrait.
 * A plain 2D canvas (no WebGL): a grid of small dots in blue/gold tints
 * whose vertical offset, size and brightness ride two overlapping sine
 * waves, so the field gently undulates and flows sideways.
 *
 * Performance rules: device-pixel-ratio capped at 1.75, the rAF loop pauses
 * when the hero is off-screen (IntersectionObserver), and with
 * prefers-reduced-motion a single static frame is drawn instead.
 */
export default function DotWaves({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = true;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const gapX = 26;
      const gapY = 24;
      const cols = Math.ceil(width / gapX) + 1;
      const rows = Math.ceil(height / gapY) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gapX;
          const baseY = r * gapY;
          // Two overlapping waves; phase shifts with the row so the bands
          // sweep diagonally, and time makes them flow.
          const w1 = Math.sin(x * 0.006 + t * 0.00055 + r * 0.55);
          const w2 = Math.sin(x * 0.013 - t * 0.00035 + r * 0.2);
          const y = baseY + w1 * 13 + w2 * 5;
          const crest = Math.max(0, w1 * 0.5 + w2 * 0.5);
          const radius = 0.7 + crest * 1.5;
          const alpha = 0.05 + crest * 0.34;
          // Roughly one dot in seven is gold, the rest blue — same mix as
          // the site's gradient tokens.
          const gold = (c * 7 + r * 3) % 7 === 0;
          ctx.fillStyle = gold
            ? `rgba(245, 179, 1, ${alpha})`
            : `rgba(96, 165, 250, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      if (running && visible) draw(t);
      rafId = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let io: IntersectionObserver | null = null;
    if (!reduced) {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0 },
      );
      io.observe(canvas);
      rafId = requestAnimationFrame(loop);
    } else {
      draw(1200); // one settled static frame
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
