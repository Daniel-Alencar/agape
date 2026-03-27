"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Email ou senha incorretos"
        : error.message
      );
      setLoading(false);
      return;
    }

    toast.success("Bem-vindo de volta! 🙏");
    router.push("/discover");
    router.refresh();
  }

  return (
    <div
      className="page-in"
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 24,
          padding: "40px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top cross decoration */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            fontSize: 120,
            opacity: 0.04,
            color: "#D4AF37",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          ✝
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✝️</div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 38,
              fontWeight: 600,
              lineHeight: 1,
              marginBottom: 6,
            }}
            className="gold-shimmer"
          >
            Ágape
          </h1>
          <p style={{ color: "rgba(248, 244, 236, 0.55)", fontSize: 14 }}>
            Entre na sua conta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(248, 244, 236, 0.7)",
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="divine-input"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(248, 244, 236, 0.7)",
                marginBottom: 6,
                letterSpacing: "0.5px",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="divine-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={loading}
            style={{ width: "100%", marginTop: 8, position: "relative" }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Entrando...
              </>
            ) : (
              "✨ Entrar"
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0 20px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.2)" }} />
          <span style={{ fontSize: 12, color: "rgba(248,244,236,0.4)" }}>✝</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.2)" }} />
        </div>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "rgba(248, 244, 236, 0.5)",
          }}
        >
          Ainda não tem conta?{" "}
          <Link
            href="/auth/register"
            style={{
              color: "#FFD700",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Criar conta
          </Link>
        </p>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link
            href="/"
            style={{
              fontSize: 12,
              color: "rgba(248,244,236,0.3)",
              textDecoration: "none",
            }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
