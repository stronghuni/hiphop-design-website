"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./backdrop.module.css";

/**
 * 섹션 배경 = 스포트라이트(2026-09-28 대표 결정 — 깨진 픽셀·프로스트·열리는 창 시안과 비교해 골랐다).
 * 사진 위를 검정 면이 덮고, 부드러운 둥근 빛 하나만 사진을 비춘다. 빛은 포인터를 따라가고, 포인터가 섹션 밖이면
 * `rest` 자리(모서리·변)에 머문다. `spot={false}`면 빛 없이 검정 + 글자 창만(사전 예약).
 * `[data-knockout]` 글자는 검정 면에서 파내 같은 사진이 글자 안에 비친다 — 빛 위치와 상관없이 항상 읽힌다.
 */

type Anchor = "tl" | "tr" | "bl" | "br" | "t" | "r" | "b" | "l";

/** 모서리·변 이름 → 섹션 안 기준 좌표(0~1). 스포트라이트가 쉴 때 머무는 자리. */
function anchorPoint(a: Anchor): [number, number] {
  const x = a.includes("l") ? 0.12 : a.includes("r") ? 0.88 : 0.5;
  const y = a.startsWith("t") ? 0.18 : a.startsWith("b") ? 0.82 : 0.5;
  return [x, y];
}

function drawVeil(canvas: HTMLCanvasElement, rest: Anchor, spot: boolean, pointer: [number, number] | null) {
  const { width: w, height: h } = canvas.getBoundingClientRect();
  if (!w || !h) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
  if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (spot) {
    const [rx, ry] = anchorPoint(rest);
    const [px, py] = pointer ?? [rx * w, ry * h];
    // 반지름 = 긴 변의 20%(대표 지시: 더 작게).
    const r = Math.max(w, h) * 0.2;
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.45, "rgba(0,0,0,0.85)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  knockoutText(ctx, canvas);
}

function knockoutText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // 글자 한 줄 상자 = CSS 인라인 배치 그대로(line-height 안에서 반행간 + 글꼴 ascent가 기준선). 부모의 scaleY는
  // 렌더된 상자 높이 ÷ 배치 높이로 그대로 따라 늘린다. 진입 애니메이션 중(`data-hero-intro=running`)에는 파지 않는다.
  const box = canvas.getBoundingClientRect();
  for (const el of canvas.closest("section, header")?.querySelectorAll<HTMLElement>("[data-knockout]") ?? []) {
    if (el.closest("[data-hero-intro='running']")) continue;
    const r = el.getBoundingClientRect();
    // 빛이 글자 뒤를 비추면 글자와 배경이 같은 사진이라 묻힌다 — 글자 둘레를 먼저 부드러운 검정으로 덮고 그 위에 판다.
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.filter = "blur(24px)";
    ctx.fillRect(r.left - box.left - 24, r.top - box.top - 24, r.width + 48, r.height + 48);
    ctx.restore();
    // 파내는 색은 불투명이어야 한다 — 빛의 그라데이션 fillStyle이 남아 있으면 빛 밖에서 투명하게 파여 글자가 사라졌다.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    const cs = getComputedStyle(el);
    const fontSize = parseFloat(cs.fontSize);
    const layoutH = cs.lineHeight === "normal" ? fontSize * 1.2 : parseFloat(cs.lineHeight);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const text = el.textContent ?? "";
    const m = ctx.measureText(text);
    const baseline = (layoutH - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    ctx.save();
    ctx.translate(r.left - box.left + r.width / 2, r.top - box.top);
    ctx.scale(1, r.height / layoutH);
    ctx.fillText(text, 0, baseline);
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";
}

export default function Backdrop({
  src,
  rest = "tr",
  lift,
  spot = true,
}: {
  src: string;
  /** 포인터가 섹션 밖일 때 빛이 머무는 자리. */
  rest?: Anchor;
  /** 사진의 검정을 이 색까지 들어 올린다(screen) — 어두운 사진에서도 글자 창의 윤곽이 검정 면과 갈린다. */
  lift?: string;
  /** false면 빛 없이 검정 + 글자 창만 둔다(사전 예약, 대표 지시). */
  spot?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let pointer: [number, number] | null = null;
    const draw = () => {
      drawVeil(canvas, rest, spot, pointer);
      // 첫 그림 전에는 사진을 감춘다(CSS) — 안 그러면 한 프레임 동안 사진 전체가 번쩍 보인다.
      if (canvas.parentElement) canvas.parentElement.dataset.ready = "1";
    };
    draw();
    // 글자 창은 웹폰트(Anton)가 붙은 뒤 다시 파야 모양이 맞는다.
    void document.fonts?.ready.then(draw);
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    // 페이지 진입 애니메이션(`data-hero-intro`)이 끝나면 다시 그려 글자 창을 판다 — 빼면 11.09가 영영 안 파였다.
    const intro = canvas.closest<HTMLElement>("[data-hero-intro]");
    const introObserver = new MutationObserver(draw);
    if (intro) introObserver.observe(intro, { attributes: true, attributeFilter: ["data-hero-intro"] });
    let raf = 0;
    const onPointer = (event: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
      pointer = inside ? [event.clientX - r.left, event.clientY - r.top] : null;
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), draw()));
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (spot && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      introObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rest, spot]);

  return (
    <div className={styles.backdrop} aria-hidden>
      <Image className={styles.photo} src={src} alt="" fill sizes="100vw" />
      {lift ? <span className={styles.lift} style={{ background: lift }} /> : null}
      <canvas ref={ref} className={styles.veil} />
    </div>
  );
}
