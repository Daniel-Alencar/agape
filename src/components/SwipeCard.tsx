"use client";
import { useRef, useState } from "react";
import type { Profile } from "@/lib/types";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "heaven" | "hell") => void;
  isTop: boolean;
  stackIndex: number;
  onShowProfile: (profile: Profile) => void;
}

const SWIPE_THRESHOLD = 90;
const ROTATION_FACTOR = 0.06;

export function SwipeCard({ profile, onSwipe, isTop, stackIndex, onShowProfile }: SwipeCardProps) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [swipeState, setSwipeState] = useState<"none" | "heaven" | "hell">("none");
  const [launched, setLaunched] = useState(false);

  const progress = Math.min(Math.abs(pos.y) / SWIPE_THRESHOLD, 1);

  const getAge = (birthDate: string) => {
    const dob = new Date(birthDate);
    let age = new Date().getFullYear() - dob.getFullYear();
    const m = new Date().getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < dob.getDate())) age--;
    return age;
  };

  const rotate = pos.x * ROTATION_FACTOR;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop || launched) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current || !isTop || launched) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    setPos({ x: dx, y: dy });
    if (Math.abs(dy) > 25) {
      setSwipeState(dy < 0 ? "heaven" : "hell");
    } else {
      setSwipeState("none");
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const dy = e.clientY - startPosRef.current.y;
    const dx = e.clientX - startPosRef.current.x;
    const totalMove = Math.sqrt(dx * dx + dy * dy);

    if (Math.abs(dy) >= SWIPE_THRESHOLD) {
      const dir = dy < 0 ? "heaven" : "hell";
      setLaunched(true);
      setSwipeState(dir);
      setTimeout(() => onSwipe(dir), 480);
    } else {
      if (totalMove < 8) {
        onShowProfile(profile);
      }
      setPos({ x: 0, y: 0 });
      setSwipeState("none");
    }
  }

  const flyTransform =
    swipeState === "heaven"
      ? `translateY(-130vh) translateX(${pos.x * 0.5}px) rotate(${rotate - 5}deg)`
      : `translateY(130vh) translateX(${pos.x * 0.5}px) rotate(${rotate + 5}deg)`;

  const dragTransform = `translateY(${pos.y}px) translateX(${pos.x}px) rotate(${rotate}deg)`;
  const transform = launched ? flyTransform : dragTransform;
  const transition = isDraggingRef.current
    ? "none"
    : launched
    ? "transform 0.48s cubic-bezier(0.55,0,1,0.45)"
    : "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)";

  const stackY = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.05;

  if (!isTop) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${stackY}px) scale(${stackScale})`,
          transformOrigin: "bottom center",
          transition: "transform 0.35s ease",
          borderRadius: 24,
          overflow: "hidden",
          background: "#111827",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          zIndex: 10 - stackIndex,
        }}
      >
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
              filter: "blur(6px)",
              display: "block",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform,
        transition,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow:
          swipeState === "heaven"
            ? `0 0 0 3px #FFD700, 0 0 50px rgba(253,211,77,0.7), 0 30px 60px rgba(0,0,0,0.5)`
            : swipeState === "hell"
            ? `0 0 0 3px #DC2626, 0 0 50px rgba(220,38,38,0.7), 0 30px 60px rgba(0,0,0,0.5)`
            : "0 30px 60px rgba(0,0,0,0.6)",
        cursor: launched ? "default" : "grab",
        userSelect: "none",
        touchAction: "none",
        zIndex: 20,
        background: "linear-gradient(160deg, #1a2350 0%, #0a0e1a 100%)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 72, opacity: 0.5 }}>👤</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Sem foto</span>
        </div>
      )}

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Heaven glow overlay */}
      {swipeState === "heaven" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, rgba(255,215,0,${progress * 0.3}), transparent 55%)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,215,0,0.92)",
              color: "#0A0E1A",
              padding: "10px 24px",
              borderRadius: 30,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "1.5px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 24px rgba(255,215,0,0.6)",
              opacity: Math.min(progress * 1.6, 1),
              whiteSpace: "nowrap",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            ✨ CÉU — Tenho Interesse!
          </div>
        </>
      )}

      {/* Hell glow overlay */}
      {swipeState === "hell" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, rgba(220,38,38,${progress * 0.3}), transparent 55%)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 140,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(220,38,38,0.92)",
              color: "white",
              padding: "10px 24px",
              borderRadius: 30,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "1.5px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 24px rgba(220,38,38,0.6)",
              opacity: Math.min(progress * 1.6, 1),
              whiteSpace: "nowrap",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            🔥 INFERNO — Sem Interesse
          </div>
        </>
      )}

      {/* Profile info overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 24px",
          pointerEvents: "none",
        }}
      >
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 30,
            fontWeight: 600,
            color: "white",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            lineHeight: 1.1,
            margin: "0 0 4px",
          }}
        >
          {profile.full_name.split(" ")[0]},{" "}
          <span style={{ fontWeight: 300 }}>{getAge(profile.birth_date)}</span>
        </h3>

        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 13,
            margin: "0 0 10px",
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
          }}
        >
          📍 {profile.city}, {profile.state}
        </p>

        {(profile.church || profile.denomination) && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 12px",
              borderRadius: 20,
              background: "rgba(212,175,55,0.85)",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12 }}>⛪</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0A0E1A" }}>
              {profile.church || profile.denomination}
            </span>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                style={{
                  padding: "3px 10px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tap hint */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          borderRadius: 20,
          padding: "4px 10px",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "Nunito, sans-serif" }}>
          toque para ver mais
        </span>
      </div>
    </div>
  );
}
