"use client";
import type { Profile } from "@/lib/types";
import { useState, useRef } from "react";

interface ProfileDetailModalProps {
  profile: Profile;
  onClose: () => void;
  onSwipe: (direction: "heaven" | "hell") => void;
}

export function ProfileDetailModal({ profile, onClose, onSwipe }: ProfileDetailModalProps) {
  // Estados para o drag-to-close
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [isClosing, setIsClosing] = useState(false);

  const getAge = (birthDate: string) => {
    const dob = new Date(birthDate);
    let age = new Date().getFullYear() - dob.getFullYear();
    if (new Date().getMonth() - dob.getMonth() < 0) age--;
    return age;
  };

  // Funções de manipulação do arraste
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Só inicia o drag se estiver clicando perto do topo (no "drag handle") ou se o scroll estiver no topo
    const target = e.target as HTMLElement;
    const scrollContainer = target.closest('.scroll-container');
    
    // Se clicou dentro do scroll e ele não está no topo, deixa a rolagem nativa funcionar
    if (scrollContainer && scrollContainer.scrollTop > 0) return;

    isDragging.current = true;
    startY.current = e.clientY;
    // Opcional: e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    
    const deltaY = e.clientY - startY.current;
    
    // Só permite arrastar para baixo
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Se arrastou mais de 100px para baixo, fecha o modal
    if (dragY > 100) {
      handleClose();
    } else {
      // Caso contrário, volta para a posição original
      setDragY(0);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Espera a animação terminar antes de chamar o onClose real
    setTimeout(onClose, 300);
  };

  // Se estiver fechando (por drag ou botão), anima para fora da tela
  const translateY = isClosing ? "100%" : `${dragY}px`;
  const transition = isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        background: `rgba(0,0,0,${isClosing ? 0 : 0.7 - (dragY / 500)})`, // Esmaece o fundo ao arrastar
        backdropFilter: `blur(${isClosing ? 0 : Math.max(0, 6 - (dragY / 100))}px)`,
        transition: "background 0.3s, backdrop-filter 0.3s",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal panel */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          marginTop: "auto",
          maxHeight: "90vh",
          background: "linear-gradient(180deg, #0F1629 0%, #080D1A 100%)",
          borderRadius: "24px 24px 0 0",
          border: "1px solid rgba(212,175,55,0.2)",
          borderBottom: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: `translateY(${translateY})`,
          transition: transition,
          animation: isClosing ? "none" : "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          touchAction: "pan-y", // Permite rolagem vertical nativa, mas passamos a controlar se no topo
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 12px", cursor: "grab" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(212,175,55,0.4)" }} />
        </div>

        {/* Close */}
        {/* <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "rgba(248,244,236,0.6)",
            width: 34,
            height: 34,
            borderRadius: "50%",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          ×
        </button> */}

        {/* Scrollable content */}
        <div 
          className="scroll-container"
          style={{ overflowY: "auto", flex: 1, padding: "0 20px 24px" }}
        >
          {/* Photo + name hero */}
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              height: 260,
              marginBottom: 18,
              background: "linear-gradient(160deg, #1a2350 0%, #0a0e1a 100%)",
            }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                  pointerEvents: "none"
                }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.4 }}>
                👤
              </div>
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)",
                pointerEvents: "none"
              }}
            />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, pointerEvents: "none" }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "white",
                  margin: "0 0 4px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {profile.full_name}, <span style={{ fontWeight: 300 }}>{getAge(profile.birth_date)}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                📍 {profile.city}, {profile.state}
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { icon: "⛪", label: "Igreja", value: profile.church || "—" },
              { icon: "✝️", label: "Denominação", value: profile.denomination || "—" },
              { icon: "👤", label: "Gênero", value: profile.gender === "masculino" ? "Homem" : "Mulher" },
              { icon: "📍", label: "Cidade", value: `${profile.city}, ${profile.state}` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,175,55,0.12)",
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <p style={{ fontSize: 18, margin: "0 0 4px" }}>{item.icon}</p>
                <p style={{ fontSize: 11, color: "rgba(248,244,236,0.4)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#F8F4EC", margin: 0, lineHeight: 1.3 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Verse */}
          {profile.verse && (
            <div
              style={{
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, margin: "0 0 6px" }}>
                Versículo Favorito
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: "rgba(248,244,236,0.85)",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                ✝ {profile.verse}
              </p>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, margin: "0 0 8px" }}>
                Sobre mim
              </p>
              <p style={{ fontSize: 14, color: "rgba(248,244,236,0.75)", margin: 0, lineHeight: 1.7 }}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, margin: "0 0 10px" }}>
                Interesses
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: "rgba(212,175,55,0.1)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      fontSize: 12,
                      color: "#D4AF37",
                      fontWeight: 600,
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "16px 20px 24px",
            borderTop: "1px solid rgba(212,175,55,0.1)",
            flexShrink: 0,
            background: "linear-gradient(180deg, rgba(8,13,26,0.9) 0%, #080D1A 100%)",
            zIndex: 5,
          }}
        >
          <button
            onClick={() => { handleClose(); setTimeout(() => onSwipe("hell"), 300); }}
            style={{
              flex: 1,
              height: 54,
              borderRadius: 16,
              background: "rgba(220,38,38,0.12)",
              border: "2px solid rgba(220,38,38,0.4)",
              color: "#EF4444",
              fontSize: 22,
              cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            🔥 <span style={{ fontSize: 13 }}>Inferno</span>
          </button>
          <button
            onClick={() => { handleClose(); setTimeout(() => onSwipe("heaven"), 300); }}
            style={{
              flex: 2,
              height: 54,
              borderRadius: 16,
              background: "linear-gradient(135deg, #D4AF37, #FFD700)",
              border: "none",
              color: "#0A0E1A",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 20px rgba(212,175,55,0.4)",
              transition: "all 0.2s",
            }}
          >
            ✨ Enviar ao Céu!
          </button>
        </div>
      </div>
    </div>
  );
}