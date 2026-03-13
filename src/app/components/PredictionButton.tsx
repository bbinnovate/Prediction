"use client";

import { useRef, useState } from "react";

type Props = {
  onYes: () => void;
  onNo: () => void;
};

export default function PredictionButton({ onYes, onNo }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const startX = useRef(0);

  const [puckIcon, setPuckIcon] = useState<"logo" | "tick">("logo");
  const [dragging, setDragging] = useState(false);

  const updatePuck = (x: number) => {
    if (!puckRef.current) return;

    offsetRef.current = x;

    puckRef.current.style.transform = `translateX(${x}px)`;

    const railWidth = railRef.current!.offsetWidth;
    const max = railWidth / 2 - 32;
    const edgeThreshold = max - 5;

    if (x >= edgeThreshold || x <= -edgeThreshold) {
      setPuckIcon("tick");
    } else {
      setPuckIcon("logo");
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!puckRef.current) return;

    puckRef.current.setPointerCapture(e.pointerId);

    setDragging(true);
    startX.current = e.clientX - offsetRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !railRef.current) return;

    const railWidth = railRef.current.offsetWidth;
    const max = railWidth / 2 - 32;

    let newOffset = e.clientX - startX.current;

    if (newOffset > max) newOffset = max;
    if (newOffset < -max) newOffset = -max;

    updatePuck(newOffset);
  };

  const handlePointerUp = () => {
    if (!railRef.current) return;

    const railWidth = railRef.current.offsetWidth;
    const threshold = railWidth * 0.22;

    if (offsetRef.current > threshold) {
      setPuckIcon("tick");
      onYes();
    } else if (offsetRef.current < -threshold) {
      setPuckIcon("tick");
      onNo();
    }

    setTimeout(() => {
      if (!puckRef.current) return;

      puckRef.current.style.transition = "transform 0.25s ease";
      puckRef.current.style.transform = `translateX(0px)`;

      offsetRef.current = 0;

      setTimeout(() => {
        if (puckRef.current) puckRef.current.style.transition = "";
        setPuckIcon("logo");
      }, 250);
    }, 200);

    setDragging(false);
  };

  return (
    <div
      ref={railRef}
      className="relative flex items-center justify-between w-full max-w-[360px] h-[56px] px-6 rounded-full bg-[#2a2a2a] text-white select-none overflow-hidden touch-none"
    >
      {/* NO */}
      <span className="text-sm font-semibold opacity-80">NO</span>

      {/* LEFT ARROW */}
      <span className="animate-arrow-left absolute lg:left-[32%] left-[30%] text-gray-400 text-lg pointer-events-none">
        &lt;&lt;&lt;
      </span>

      {/* RIGHT ARROW */}
      <span className="animate-arrow-right absolute lg:right-[32%] right-[30%] text-gray-400 text-lg pointer-events-none">
        &gt;&gt;&gt;
      </span>

      {/* PUCK */}
      <div
        ref={puckRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[48px] h-[48px] rounded-full z-50 bg-white text-sm flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
      >
        {puckIcon === "logo" ? (
          <img
            src="/favicon.png"
            alt="select"
            className="w-10 h-10 pointer-events-none select-none"
          />
        ) : (
          <span className="text-yellow-400 text-2xl font-bold">✓</span>
        )}
      </div>

      {/* YES */}
      <span className="text-sm font-semibold opacity-80">YES</span>
    </div>
  );
}