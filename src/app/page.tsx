"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const verses = [
  "\"O amor é paciente, o amor é bondoso\" — 1 Cor 13:4",
  "\"Aquele que encontra uma esposa encontra o bem\" — Prov 18:22",
  "\"Porque eu sei os planos que tenho para vós\" — Jer 29:11",
];

export default function LandingPage() {
  const [verseIndex, setVerseIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/discover");
    });

    const interval = setInterval(() => {
      setVerseIndex((i) => (i + 1) % verses.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative cross */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          fontSize: "70vw",
          lineHeight: 1,
          color: "#D4AF37",
        }}
      >
        ✝
      </div>

      {/* Dove icon */}
      <div className="dove-float" style={{ fontSize: 56, marginBottom: 8 }}>
        🕊️
      </div>

      {/* Logo */}
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(52px, 12vw, 84px)",
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: "-1px",
        }}
        className="gold-shimmer"
      >
        Ágape
      </h1>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(14px, 3vw, 18px)",
          color: "rgba(248, 244, 236, 0.6)",
          fontStyle: "italic",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        Conexões Abençoadas
      </p>

      {/* Rotating verse */}
      <div
        className="glass"
        style={{
          padding: "14px 24px",
          borderRadius: 14,
          maxWidth: 360,
          marginBottom: 40,
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          key={verseIndex}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            color: "rgba(248, 244, 236, 0.75)",
            fontStyle: "italic",
            lineHeight: 1.5,
            animation: "pageIn 0.6s ease-out",
          }}
        >
          {verses[verseIndex]}
        </p>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
        <Link href="/auth/register" style={{ textDecoration: "none" }}>
          <button className="btn-gold" style={{ width: "100%", fontSize: 16 }}>
            ✨ Começar minha jornada
          </button>
        </Link>
        <Link href="/auth/login" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ width: "100%" }}>
            Já tenho uma conta
          </button>
        </Link>
      </div>

      {/* Swipe hint */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 20,
          color: "rgba(248, 244, 236, 0.35)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "1px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span>🔥 Inferno</span>
        <span style={{ fontSize: 18 }}>↕</span>
        <span>✨ Céu</span>
      </div>
    </div>
  );
}
