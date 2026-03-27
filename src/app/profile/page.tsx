"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Até logo! Que Deus te guie 🙏");
    router.push("/");
    router.refresh();
  }

  const getAge = (birthDate: string) => {
    const dob = new Date(birthDate);
    let age = new Date().getFullYear() - dob.getFullYear();
    if (new Date().getMonth() - dob.getMonth() < 0) age--;
    return age;
  };

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        paddingBottom: 88,
      }}
    >
      {/* Hero section */}
      <div
        style={{
          position: "relative",
          height: 200,
          background: "linear-gradient(135deg, #1e2a5e 0%, #080D1A 60%, #1a0a2e 100%)",
          overflow: "hidden",
        }}
      >
        {/* Cross bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 200,
            color: "rgba(212,175,55,0.05)",
            lineHeight: 1,
          }}
        >
          ✝
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(to bottom, transparent, #080D1A)",
          }}
        />
      </div>

      {/* Avatar (overlapping hero) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -60,
          position: "relative",
          zIndex: 5,
          padding: "0 24px 24px",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid #FFD700",
            boxShadow: "0 0 30px rgba(212,175,55,0.4)",
            marginBottom: 14,
            position: "relative",
          }}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1e2a5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>👤</div>
          )}
        </div>

        {/* Name */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 30,
            fontWeight: 600,
            margin: "0 0 2px",
            color: "#F8F4EC",
          }}
        >
          {profile.full_name}
        </h1>

        <p style={{ fontSize: 14, color: "rgba(248,244,236,0.5)", marginBottom: 4 }}>
          {getAge(profile.birth_date)} anos · {profile.city}, {profile.state}
        </p>

        {profile.church && (
          <p style={{ fontSize: 13, color: "#FFD700", opacity: 0.8, fontWeight: 600, marginBottom: 16 }}>
            ⛪ {profile.church}
          </p>
        )}

        {/* Edit button */}
        <button
          className="btn-ghost"
          style={{ marginBottom: 24 }}
          onClick={() => router.push("/setup")}
        >
          ✏️ Editar perfil
        </button>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            width: "100%",
            marginBottom: 20,
          }}
        >
          {[
            { label: "Denominação", value: profile.denomination || "—", icon: "⛪" },
            { label: "Gênero", value: profile.gender === "masculino" ? "Homem" : "Mulher", icon: "👤" },
            { label: "Procuro", value: profile.looking_for === "ambos" ? "Ambos" : profile.looking_for === "masculino" ? "Homens" : "Mulheres", icon: "💛" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-light"
              style={{
                padding: "12px 10px",
                borderRadius: 14,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
              <p style={{ fontSize: 11, color: "rgba(248,244,236,0.4)", marginBottom: 2, lineHeight: 1.2 }}>{stat.label}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#F8F4EC", lineHeight: 1.2 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Verse */}
        {profile.verse && (
          <div
            className="glass"
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 16,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
              Versículo Favorito
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                color: "rgba(248,244,236,0.8)",
                fontStyle: "italic",
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
            className="glass"
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
              Sobre mim
            </p>
            <p style={{ fontSize: 14, color: "rgba(248,244,236,0.75)", lineHeight: 1.7 }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div
            className="glass"
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
              Interesses
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.interests.map((i) => (
                <span
                  key={i}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    fontSize: 12,
                    color: "#D4AF37",
                    fontWeight: 600,
                  }}
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", margin: "8px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
          <span style={{ fontSize: 14, color: "rgba(212,175,55,0.4)" }}>✝</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            background: "transparent",
            border: "1px solid rgba(220,38,38,0.3)",
            color: "rgba(220,38,38,0.7)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.3)";
          }}
        >
          {loggingOut ? "Saindo..." : "🚪 Sair da conta"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
