"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create initial profile
      // Adicionamos 'as any' em "profiles" e no final do objeto para evitar o erro de 'never'
      await supabase.from("profiles" as any).upsert({
        id: data.user.id,
        full_name: fullName,
        birth_date: "2000-01-01",
        gender: "masculino",
        looking_for: "feminino",
        city: "",
        state: "",
        is_complete: false,
      } as any);

      setDone(true);
      toast.success("Conta criada! Confirme seu email 📧");
    }
    
    setLoading(false);
  }

  if (done) {
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
            maxWidth: 380,
            borderRadius: 24,
            padding: "48px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 12,
            }}
            className="gold-shimmer"
          >
            Confirme seu email
          </h2>
          <p style={{ color: "rgba(248,244,236,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Enviamos um link de confirmação para <strong style={{ color: "#FFD700" }}>{email}</strong>.
            Após confirmar, você poderá fazer login.
          </p>
          <Link href="/auth/login">
            <button className="btn-gold" style={{ width: "100%" }}>
              Ir para o Login
            </button>
          </Link>
        </div>
      </div>
    );
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
        overflowY: "auto",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 24,
          padding: "36px 32px",
          position: "relative",
          overflow: "hidden",
          margin: "auto",
        }}
      >
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

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🕊️</div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1,
              marginBottom: 4,
            }}
            className="gold-shimmer"
          >
            Criar Conta
          </h1>
          <p style={{ color: "rgba(248, 244, 236, 0.5)", fontSize: 13 }}>
            Comece sua jornada no Ágape
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(248,244,236,0.7)", marginBottom: 5 }}>
              Nome
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              className="divine-input"
              required
              minLength={3}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(248,244,236,0.7)", marginBottom: 5 }}>
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
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(248,244,236,0.7)", marginBottom: 5 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="divine-input"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(248,244,236,0.7)", marginBottom: 5 }}>
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="divine-input"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={loading}
            style={{ width: "100%", marginTop: 6 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Criando conta...
              </>
            ) : (
              "✝️ Criar minha conta"
            )}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.2)" }} />
          <span style={{ fontSize: 12, color: "rgba(248,244,236,0.4)" }}>✝</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.2)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(248,244,236,0.5)" }}>
          Já tem conta?{" "}
          <Link href="/auth/login" style={{ color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
