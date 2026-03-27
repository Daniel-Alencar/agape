"use client";
import { useEffect, useRef } from "react";
import type { Profile } from "@/lib/types";

interface MatchModalProps {
  matchedProfile: Profile;
  myProfile: Profile;
  onClose: () => void;
  onMessage: () => void;
}

export function MatchModal({ matchedProfile, myProfile, onClose, onMessage }: MatchModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle confetti effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; life: number; maxLife: number;
      shape: "star" | "cross" | "circle";
    }[] = [];

    const colors = ["#FFD700", "#FFF8DC", "#D4AF37", "#FFFACD", "#FFE97D", "#fff"];
    const shapes = ["star", "cross", "circle"] as const;

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 8 + 4),
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 80 + 60,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.4;
        if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    }

    function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.fillRect(x - size / 6, y - size / 2, size / 3, size);
      ctx.fillRect(x - size / 2, y - size / 6, size, size / 3);
    }

    let frame: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life++;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx!, p.x, p.y, p.size);
        } else if (p.shape === "cross") {
          drawCross(ctx!, p.x, p.y, p.size);
        } else {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      ctx!.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  const getAge = (birthDate: string) => {
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() - dob.getMonth() < 0) age--;
    return age;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <div
        className="match-reveal"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
        }}
      >
        {/* Golden glow bg */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background: "radial-gradient(ellipse at center, rgba(212,175,55,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Halo */}
        <div
          style={{
            width: 60,
            height: 60,
            margin: "0 auto 8px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="halo-ring"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "rgba(255,215,0,0.7)",
            }}
          />
          <span style={{ fontSize: 28 }}>🕊️</span>
        </div>

        <p
          style={{
            fontSize: 11,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.8)",
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          Conexão Abençoada
        </p>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 10vw, 52px)",
            fontWeight: 600,
            lineHeight: 1,
            marginBottom: 8,
          }}
          className="gold-shimmer"
        >
          É um Match!
        </h2>

        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            color: "rgba(248,244,236,0.65)",
            fontStyle: "italic",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          &ldquo;Dois são melhor do que um.&rdquo;
          <br />
          <span style={{ fontSize: 13, opacity: 0.7 }}>— Eclesiastes 4:9</span>
        </p>

        {/* Profile photos */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
            marginBottom: 28,
          }}
        >
          {/* My photo */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #FFD700",
              boxShadow: "0 0 20px rgba(255,215,0,0.5)",
              zIndex: 2,
              position: "relative",
              right: -10,
            }}
          >
            {myProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={myProfile.avatar_url} alt="Você" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1e2a5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👤</div>
            )}
          </div>

          {/* Heart separator */}
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #D4AF37, #FFD700)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              zIndex: 3,
              boxShadow: "0 0 20px rgba(255,215,0,0.6)",
              flexShrink: 0,
            }}
          >
            ✝
          </div>

          {/* Match photo */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #FFD700",
              boxShadow: "0 0 20px rgba(255,215,0,0.5)",
              zIndex: 2,
              position: "relative",
              left: -10,
            }}
          >
            {matchedProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={matchedProfile.avatar_url} alt={matchedProfile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1e2a5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👤</div>
            )}
          </div>
        </div>

        {/* Names */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            color: "rgba(248,244,236,0.9)",
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          {myProfile.full_name.split(" ")[0]} & {matchedProfile.full_name.split(" ")[0]}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-gold" style={{ width: "100%", fontSize: 15 }} onClick={onMessage}>
            💬 Enviar mensagem
          </button>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={onClose}>
            Continuar descobrindo
          </button>
        </div>
      </div>
    </div>
  );
}
