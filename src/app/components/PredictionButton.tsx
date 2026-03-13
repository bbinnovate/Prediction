"use client";

import { useRef, useState } from "react";

type Props = {
  onYes: () => void;
  onNo: () => void;
};

export default function PredictionButton({ onYes, onNo }: Props) {
  const railRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX - offset;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !railRef.current) return;

    const railWidth = railRef.current.offsetWidth;
    const max = railWidth / 2 - 40; // travel distance

    let newOffset = e.clientX - startX.current;

    if (newOffset > max) newOffset = max;
    if (newOffset < -max) newOffset = -max;

    setOffset(newOffset);
  };

  const resetSlider = () => {
    setTimeout(() => {
      setOffset(0);
    }, 200);
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

  return (
    <div className="flex justify-center w-full">
      <div
        ref={railRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex items-center justify-between w-full max-w-[360px] h-[56px] px-6 rounded-full bg-[#2a2a2a] text-white select-none overflow-hidden"
      >
        <span className="text-sm font-semibold tracking-wide opacity-70">
          NO
        </span>

        {/* Draggable puck */}
        <div
          onPointerDown={handlePointerDown}
          style={{
            left: `calc(50% + ${offset}px - 24px)`
          }}
          className="absolute top-1/2 -translate-y-1/2 w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300"
        >
          👕
        </div>

        <span className="text-sm font-semibold tracking-wide opacity-70">
          YES
        </span>
      </div>
    </div>
  );
}