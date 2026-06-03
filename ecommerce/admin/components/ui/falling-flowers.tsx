"use client";

import { useEffect, useRef, useState } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleAngle: number;
  flipAngle: number;   // góc lật 3D (quanh trục Y)
  flipSpeed: number;   // tốc độ lật
  type: number;
  color: string;
}

const PETAL_COLORS = [
  "#FFB7C5",
  "#FFC2CC",
  "#FF9EB5",
  "#FFAEC9",
  "#F4A7B9",
  "#FFD1DC",
  "#FF85A1",
  "#FDE8EE",
];

function createPetal(canvasWidth: number, layer: "bg" | "fg"): Petal {
  const type = Math.floor(Math.random() * 3);

  // Hoa background nhỏ hơn & mờ hơn để có cảm giác xa
  const baseSize =
    layer === "bg"
      ? type === 0
        ? Math.random() * 3 + 2    // bg hoa đào: 2–5px
        : type === 1
          ? Math.random() * 2 + 2    // bg cánh đơn: 2–4px
          : Math.random() * 3 + 3    // bg anh đào: 3–6px
      : type === 0
        ? Math.random() * 5 + 4      // fg hoa đào: 4–9px
        : type === 1
          ? Math.random() * 3 + 3      // fg cánh đơn: 3–6px
          : Math.random() * 6 + 5;     // fg anh đào: 5–11px

  // Tốc độ rơi chậm hơn nhiều
  const baseSpeedY = layer === "bg"
    ? Math.random() * 0.4 + 0.2   // bg: rất chậm (0.2–0.6)
    : Math.random() * 0.5 + 0.35; // fg: chậm (0.35–0.85)

  const baseOpacity = layer === "bg"
    ? Math.random() * 0.25 + 0.2  // bg mờ: 0.2–0.45
    : Math.random() * 0.35 + 0.5; // fg rõ: 0.5–0.85

  return {
    x: Math.random() * canvasWidth,
    y: -baseSize * 2,
    size: baseSize,
    opacity: baseOpacity,
    speedY: baseSpeedY,
    speedX: (Math.random() - 0.5) * 0.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2.5,   // xoay nhanh hơn
    wobble: Math.random() * 1.2 + 0.4,
    wobbleSpeed: Math.random() * 0.015 + 0.008,
    wobbleAngle: Math.random() * Math.PI * 2,
    flipAngle: Math.random() * Math.PI * 2,        // góc lật ban đầu ngẫu nhiên
    flipSpeed: Math.random() * 0.04 + 0.015,       // tốc độ lật: 0.015–0.055 rad/frame
    type,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  };
}

function drawPeachFlower(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(Math.cos(p.flipAngle), 1); // lật 3D quanh trục Y
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -p.size * 0.5, p.size * 0.28, p.size * 0.48, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(0, -p.size * 0.5, 0, 0, -p.size * 0.5, p.size * 0.5);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, p.color);
    g.addColorStop(1, p.color + "BB");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.globalAlpha = p.opacity * 0.75;
  ctx.fill();
  ctx.restore();
}

function drawSinglePetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(Math.cos(p.flipAngle), 1); // lật 3D
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(0, -p.size * 0.3, 0, 0, 0, p.size);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.4, p.color);
  g.addColorStop(1, p.color + "88");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function drawCherryBlossom(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(Math.cos(p.flipAngle), 1); // lật 3D
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -p.size * 0.45, p.size * 0.3, p.size * 0.42, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(0, -p.size * 0.45, 0, 0, -p.size * 0.45, p.size * 0.5);
    g.addColorStop(0, "#FFF0F5");
    g.addColorStop(0.5, p.color);
    g.addColorStop(1, "#FF69B4BB");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = p.size * 0.2;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, p.size * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.globalAlpha = p.opacity * 0.85;
    ctx.fill();
  }
  ctx.restore();
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  if (p.type === 0) drawPeachFlower(ctx, p);
  else if (p.type === 1) drawSinglePetal(ctx, p);
  else drawCherryBlossom(ctx, p);
}

// Module-level shared state (safe: single instance per page)
let _prevScrollY = 0;
let _mouseX = -9999;
let _mouseY = -9999;
let _clickX = -9999;
let _clickY = -9999;
let _clickTime = 0;

function animatePetals(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  petals: Petal[],
  layer: "bg" | "fg",
  rafRef: { current: number }
) {
  const tick = () => {
    const scrollY = window.scrollY;

    // How much the user scrolled since last frame
    // Positive = scrolled down → push petals UPWARD (negative y)
    const scrollDelta = scrollY - _prevScrollY;
    _prevScrollY = scrollY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();

    petals.forEach((petal, i) => {
      petal.wobbleAngle += petal.wobbleSpeed;
      petal.flipAngle   += petal.flipSpeed;   // cập nhật góc lật 3D
      petal.x += petal.speedX + Math.sin(petal.wobbleAngle) * petal.wobble;

      // Normal fall + scroll drag
      petal.y += petal.speedY - scrollDelta * 0.85;
      petal.rotation += petal.rotationSpeed;

      // ── Mouse repulsion ───────────────────────────────────────────
      const repelR = layer === "fg" ? 90 : 55;
      const mdx = petal.x - _mouseX;
      const mdy = petal.y - _mouseY;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < repelR && mdist > 0) {
        const force = ((repelR - mdist) / repelR) * 5;
        petal.x += (mdx / mdist) * force;
        petal.y += (mdy / mdist) * force;
        petal.rotation += force * 2; // spin when pushed
      }

      // ── Click burst (within 120ms of click) ──────────────────────
      if (now - _clickTime < 120) {
        const cdx = petal.x - _clickX;
        const cdy = petal.y - _clickY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const burstR = 130;
        if (cdist < burstR && cdist > 0) {
          const burst = ((burstR - cdist) / burstR) * 14;
          petal.x += (cdx / cdist) * burst;
          petal.y += (cdy / cdist) * burst;
          petal.rotation += burst * 5;
        }
      }

      // Reset when out of screen
      if (petal.y > canvas.height + petal.size * 2) {
        petals[i] = createPetal(canvas.width, layer);
      }
      if (petal.y < -petal.size * 8) {
        petals[i] = createPetal(canvas.width, layer);
        petals[i].y = -petals[i].size;
      }
      if (petal.x < -petal.size * 3) petal.x = canvas.width + petal.size;
      if (petal.x > canvas.width + petal.size * 3) petal.x = -petal.size;

      drawPetal(ctx, petal);
    });

    rafRef.current = requestAnimationFrame(tick);
  };
  rafRef.current = requestAnimationFrame(tick);
}

// ─── Layer hook ─────────────────────────────────────────────────────────────
function useLayer(
  layer: "bg" | "fg",
  count: number,
  zIndex: number,
  enabled: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Khi tắt: dừng animation & xoá canvas
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const petals: Petal[] = Array.from({ length: count }, () => {
      const p = createPetal(canvas.width, layer);
      p.y = Math.random() * canvas.height;
      return p;
    });

    animatePetals(canvas, ctx, petals, layer, rafRef);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [layer, count, enabled]);

  return { canvasRef, zIndex };
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function FallingFlowers() {
  // Luôn init true (khớp với server SSR), sau đó sync từ localStorage phía client
  const [enabled, setEnabled] = useState(true);
  const [hovered, setHovered] = useState(false);

  // Chỉ chạy trên client sau khi mount → tránh hydration mismatch
  useEffect(() => {
    try {
      if (localStorage.getItem("gs-flowers") === "0") setEnabled(false);
    } catch {}
  }, []);

  const bg = useLayer("bg", 50, 1, enabled);
  const fg = useLayer("fg", 40, 50, enabled);

  const toggle = () => {
    setEnabled(v => {
      const next = !v;
      try { localStorage.setItem("gs-flowers", next ? "1" : "0"); } catch {}
      return next;
    });
  };


  // Track mouse & touch at window level
  useEffect(() => {
    const onMove = (e: MouseEvent) => { _mouseX = e.clientX; _mouseY = e.clientY; };
    const onTouch = (e: TouchEvent) => {
      _mouseX = e.touches[0].clientX;
      _mouseY = e.touches[0].clientY;
    };
    const onLeave = () => { _mouseX = -9999; _mouseY = -9999; };
    const onClick = (e: MouseEvent) => {
      _clickX = e.clientX;
      _clickY = e.clientY;
      _clickTime = performance.now();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const canvasStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  return (
    <>
      {/* Canvas luôn tồn tại — ẩn/hiện qua enabled trong useLayer */}
      <canvas ref={bg.canvasRef} aria-hidden="true" style={{ ...canvasStyle, zIndex: bg.zIndex }} />
      <canvas ref={fg.canvasRef} aria-hidden="true" style={{ ...canvasStyle, zIndex: fg.zIndex }} />

      {/* ── Nút tắt/bật hoa rơi ── */}
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={enabled ? "Tắt hoa rơi" : "Bật hoa rơi"}
        aria-label={enabled ? "Tắt hoa rơi" : "Bật hoa rơi"}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: hovered ? "10px 16px 10px 12px" : "10px 12px",
          borderRadius: "50px",
          border: `2px solid ${enabled ? "rgba(255,150,170,0.7)" : "rgba(180,180,180,0.5)"}`,
          background: enabled
            ? "rgba(255, 220, 230, 0.88)"
            : "rgba(240, 240, 240, 0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          boxShadow: enabled
            ? "0 4px 20px rgba(220, 100, 140, 0.3)"
            : "0 4px 16px rgba(0,0,0,0.12)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontSize: "18px",
          lineHeight: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          transform: hovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        }}
      >
        <span style={{
          display: "inline-block",
          transition: "transform 0.4s ease, filter 0.3s ease",
          transform: enabled ? "rotate(0deg)" : "rotate(-30deg)",
          filter: enabled ? "none" : "grayscale(1) opacity(0.5)",
        }}>
          🌸
        </span>

        {/* Label hiện ra khi hover */}
        <span style={{
          maxWidth: hovered ? "100px" : "0px",
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          transition: "max-width 0.3s ease, opacity 0.25s ease",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "sans-serif",
          color: enabled ? "#B03060" : "#888",
          letterSpacing: "0.3px",
        }}>
          {enabled ? "Tắt hoa" : "Bật hoa"}
        </span>

        {/* Dấu gạch chéo khi tắt */}
        {!enabled && (
          <span style={{
            position: "absolute",
            top: "50%",
            left: "12px",
            transform: "translateY(-50%) rotate(-45deg)",
            width: "22px",
            height: "2px",
            background: "#999",
            borderRadius: "2px",
            pointerEvents: "none",
          }} />
        )}
      </button>
    </>
  );
}
