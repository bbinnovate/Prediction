// components/Button.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

interface ButtonProps {
  text: string;
  href?: string;           // optional link
  onClick?: () => void;    // click handler
  className?: string;
  disabled?: boolean; 
  target?: string; // for external links
  rel?: string;    // for external links
   type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  text,
  href,
  onClick,
  className = "",
  disabled = false,
  target,
  rel,
}) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);

  // Measure width (include some padding)
  const measure = useCallback(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth + 32);
    }
  }, []);

  useEffect(() => {
    measure();
  }, [text, measure]);

  // Re-measure on resize (helps responsive cases)
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // ensure non-breaking spaces preserved
  const chars = (text ?? "").split("").map((char) =>
    char === " " ? "\u00A0" : char
  );

  // click handler that resets hovered and sets a short active state
  const handleClick = () => {
    if (disabled) return;
    // ensure hover resets on click so the hover animation doesn't stick
    setHovered(false);

    // quick active feedback
    setActive(true);
    setTimeout(() => setActive(false), 160);

    if (onClick) onClick();
  };

  // Common event handlers (pointer covers mouse and touch)
  const handlePointerEnter = () => !disabled && setHovered(true);
  const handlePointerLeave = () => {
    !disabled && setHovered(false);
    !disabled && setActive(false);
  };
  const handlePointerDown = () => !disabled && setActive(true);
  const handlePointerUp = () => !disabled && setActive(false);
  const handleBlur = () => {
    // when focus leaves, make sure hover/active cleared
    setHovered(false);
    setActive(false);
  };

  const content = (
    <div
      className={`relative z-10 px-4 h-12 flex items-center justify-center uppercase body3 cursor-pointer`}
      // ensure children transforms work (Tailwind requires transform when using translate utilities in some setups)
      // adding `transform` to the parent makes translate utilities applied on children behave consistently.
    >
      <span ref={textRef} className="flex items-center">
        {chars.map((char, idx) => (
          <span
            key={idx}
            className="relative flex items-center overflow-hidden h-6 lg:h-7"
            style={{ transitionDelay: `${idx * 30}ms` }}
          >
            {/* top (outgoing) */}
            <span
              // ensure `transform` is available - `transform` utility isn't required on every Tailwind setup,
              // but adding it to the element where translate- utilities are used is safe.
              className={`block transform transition-transform duration-300 ease-in-out ${
                hovered && !disabled ? "-translate-y-7" : "translate-y-0"
              }`}
            >
              {char}
            </span>

            {/* bottom (incoming) */}
            <span
              className={`block absolute left-0 top-0 transform transition-transform duration-300 ease-in-out ${
                hovered && !disabled ? "translate-y-1" : "translate-y-7"
              }`}
              aria-hidden
            >
              {char}
            </span>
          </span>
        ))}

        {/* plus sign — kept outside the per-char animation */}
        <span className="text-[18px] font-normal select-none ml-1">+</span>
      </span>
    </div>
  );

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onBlur={handleBlur}
      // keep focusable container semantics if keyboard-used; but underlying button/link will receive focus
    >
      {/* Background animation. pointer-events-none prevents it from blocking mouse/pointer leave events. */}
     <div
        className={`absolute inset-y-0 my-auto rounded-full transition-all duration-300 ease-in-out h-12 bg-[var(--color-highlight)] pointer-events-none`}
        style={{
          width: hovered && !disabled ? textWidth : 48,
          left: -5,
          opacity: disabled ? 0.5 : 1,
          transform: active ? "scale(0.97)" : undefined,
        }}
      />

      {/* Render external link (<a>) or internal Next Link or native button */}
      {href ? (
        target ? (
          <a
            href={href}
            target={target}
            rel={rel}
            className={disabled ? "pointer-events-none relative z-10" : "relative z-10"}
            onClick={handleClick}
            onBlur={handleBlur}
          >
            {content}
          </a>
        ) : (
          <Link
            href={disabled ? "#" : href}
            className={disabled ? "pointer-events-none relative z-10" : "relative z-10"}
            onClick={handleClick}
            onBlur={handleBlur}
          >
            {content}
          </Link>
        )
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled}
          className="relative z-10 body3"
          onBlur={handleBlur}
        >
          {content}
        </button>
      )}
    </div>
  );
};

export default Button;
