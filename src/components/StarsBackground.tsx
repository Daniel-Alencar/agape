"use client";
import { useEffect, useRef } from "react";

export function StarsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const count = 80;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2.5 + 0.5;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --duration: ${Math.random() * 4 + 2}s;
        --delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.7 + 0.3};
      `;
      container.appendChild(star);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="stars-bg"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a2250 0%, #0a0e1a 55%, #050810 100%)",
      }}
    />
  );
}
