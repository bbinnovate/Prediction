"use client";

import { useRef, useState } from "react";

type Props = {
  onYes: () => void;
  onNo: () => void;
};

export default function PredictionButton({ onYes, onNo }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!puckRef.current) return;

    puckRef.current.setPointerCapture(e.pointerId);

    setDragging(true);
    startX.current = e.clientX - offset;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !railRef.current) return;

    const railWidth = railRef.current.offsetWidth;
    const max = railWidth / 2 - 32;

    let newOffset = e.clientX - startX.current;

    if (newOffset > max) newOffset = max;
    if (newOffset < -max) newOffset = -max;

    setOffset(newOffset);
  };

  const resetSlider = () => {
    setTimeout(() => setOffset(0), 150);
  };

  const handlePointerUp = () => {
    if (!railRef.current) return;

    const railWidth = railRef.current.offsetWidth;
    const threshold = railWidth * 0.22;

    if (offset > threshold) {
      onYes();
      resetSlider();
    } else if (offset < -threshold) {
      onNo();
      resetSlider();
    } else {
      resetSlider();
    }

    setDragging(false);
  };

  const slidingRight = offset > 10;
const slidingLeft = offset < -10;

 return (
  <div
    ref={railRef}
    className="slider-hover relative flex items-center justify-between w-full max-w-[360px] h-[56px] px-6 rounded-full bg-[#2a2a2a] text-white select-none overflow-hidden touch-none"
  >
    {/* LEFT LABEL */}
    <span
      className={`text-sm font-semibold transition-all duration-200 ${
        slidingRight ? "opacity-40 blur-[1px]" : "opacity-80"
      }`}
    >
      NO
    </span>

    {/* LEFT ARROW */}
    {/* LEFT ARROW */}
<span
  className={`animate-arrow-left absolute lg:left-[32%] left-[30%] text-gray-400 text-lg pointer-events-none ${
    slidingRight ? "opacity-40 blur-[1px]" : "opacity-80"
  }`}
>
  &lt;&lt;&lt;
</span>

{/* RIGHT ARROW */}
<span
  className={`animate-arrow-right absolute lg:right-[32%] right-[30%] text-gray-400 text-lg pointer-events-none ${
    slidingLeft ? "opacity-40 blur-[1px]" : "opacity-80"
  }`}
>
  &gt;&gt;&gt;
</span>





    {/* PUCK */}
    <div
      ref={puckRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        left: `calc(50% + ${offset}px - 24px)`
      }}
      className="absolute top-1/2 -translate-y-1/2 w-[48px] h-[48px] rounded-full z-50 bg-white black-text text-sm flex items-center justify-center shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing"
    >

        <img
  src="/favicon.png"
  alt="select"
  className="w-10 h-10 pointer-events-none select-none"
/>
     {/* select */}
    </div>

    {/* RIGHT LABEL */}
    <span
      className={`text-sm font-semibold transition-all duration-200 ${
        slidingLeft ? "opacity-40 blur-[1px]" : "opacity-80"
      }`}
    >
      YES
    </span>
  </div>
);
}