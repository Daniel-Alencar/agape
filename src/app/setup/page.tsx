"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { CHRISTIAN_INTERESTS, DENOMINATIONS } from "@/lib/types";

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

type Step = 1 | 2 | 3 | 4;

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    gender: "masculino" as "masculino" | "feminino",
    looking_for: "feminino" as "masculino" | "feminino" | "ambos",
    city: "",
    state: "SP",
    church: "",
    denomination: "",
    bio: "",
    verse: "",
    interests: [] as string[],
    avatar_url: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      supabase.from("profiles").select("*").eq("id", data.user.id).single()
        .then(({ data: profile }) => {
          if (profile) {
            setForm((prev) => ({
              ...prev,
              full_name: profile.full_name || "",
              birth_date: profile.birth_date || "",
              gender: profile.gender || "masculino",
              looking_for: profile.looking_for || "feminino",
              city: profile.city || "",
              state: profile.state || "SP",
              church: profile.church || "",
              denomination: profile.denomination || "",
              bio: profile.bio || "",
              verse: profile.verse || "",
              interests: profile.interests || [],
              avatar_url: profile.avatar_url || "",
            }));
          }
        });
    });
  }, [router]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao fazer upload da foto"); setUploading(false); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    toast.success("Foto enviada! ✨");
    setUploading(false);
  }

  async function handleSave() {
    if (!form.full_name || !form.birth_date || !form.city) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id, ...form, is_complete: true, updated_at: new Date().toISOString(),
    });

    if (error) { toast.error("Erro ao salvar: " + error.message); setLoading(false); return; }
    toast.success("Perfil criado! Que Deus abençoe sua jornada 🙏");
    router.push("/discover");
  }

  function toggleInterest(interest: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 8 ? [...prev.interests, interest] : prev.interests,
    }));
  }

  const steps = [
    { num: 1, label: "Pessoal", icon: "👤" },
    { num: 2, label: "Igreja", icon: "⛪" },
    { num: 3, label: "Sobre mim", icon: "✍️" },
    { num: 4, label: "Foto", icon: "📷" },
  ];

  return (
    /* Outer wrapper: fixed height, scrollable */
    <div
      className="page-in"
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 20px 48px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600 }} className="gold-shimmer">
          Configure seu Perfil
        </h1>
        <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 13, marginTop: 4 }}>
          Passo {step} de 4
        </p>
      </div>

      {/* Step progress bars */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, width: "100%", maxWidth: 440 }}>
        {steps.map((s) => (
          <div
            key={s.num}
            style={{
              flex: 1, height: 4, borderRadius: 4,
              background: step >= s.num
                ? "linear-gradient(90deg, #D4AF37, #FFD700)"
                : "rgba(255,255,255,0.1)",
              transition: "background 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 24,
          padding: "28px 24px 24px",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Step icon */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 30 }}>{steps[step - 1].icon}</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "#FFD700", marginTop: 4 }}>
            {steps[step - 1].label}
          </h2>
        </div>

        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome completo *</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Seu nome completo" className="divine-input" />
            </div>
            <div>
              <label style={labelStyle}>Data de nascimento *</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="divine-input" max={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label style={labelStyle}>Gênero *</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "masculino" | "feminino" })} className="divine-input">
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Procuro por *</label>
              <select value={form.looking_for} onChange={(e) => setForm({ ...form, looking_for: e.target.value as "masculino" | "feminino" | "ambos" })} className="divine-input">
                <option value="feminino">Mulheres</option>
                <option value="masculino">Homens</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Sua cidade" className="divine-input" />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="divine-input">
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Church ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome da sua Igreja</label>
              <input type="text" value={form.church} onChange={(e) => setForm({ ...form, church: e.target.value })}
                placeholder="Ex: Igreja Batista Central" className="divine-input" />
            </div>
            <div>
              <label style={labelStyle}>Denominação</label>
              <select value={form.denomination} onChange={(e) => setForm({ ...form, denomination: e.target.value })} className="divine-input">
                <option value="">Selecione...</option>
                {DENOMINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Versículo favorito</label>
              <input type="text" value={form.verse} onChange={(e) => setForm({ ...form, verse: e.target.value })}
                placeholder="Ex: João 3:16" className="divine-input" />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 10 }}>Interesses (max. 8)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CHRISTIAN_INTERESTS.map((interest) => {
                  const selected = form.interests.includes(interest);
                  return (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                      style={{
                        padding: "6px 13px", borderRadius: 20,
                        border: selected ? "1px solid #FFD700" : "1px solid rgba(212,175,55,0.25)",
                        background: selected ? "rgba(212,175,55,0.2)" : "transparent",
                        color: selected ? "#FFD700" : "rgba(248,244,236,0.55)",
                        fontSize: 12, fontWeight: selected ? 700 : 400,
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "Nunito, sans-serif",
                      }}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Bio ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>
                Sobre você{" "}
                <span style={{ color: "rgba(248,244,236,0.4)" }}>({form.bio.length}/300)</span>
              </label>
              <textarea value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 300) })}
                placeholder="Conte um pouco sobre você, sua fé e o que busca..."
                className="divine-input" rows={6}
                style={{ resize: "none", lineHeight: 1.6 }}
              />
            </div>
            <div className="glass-light" style={{ borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "rgba(248,244,236,0.65)", fontStyle: "italic", lineHeight: 1.6, textAlign: "center", margin: 0 }}>
                💡 Seja autêntico! Fale sobre sua caminhada com Deus, seus valores e o que você busca em um relacionamento.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 4: Photo ── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
            <div
              style={{
                width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
                border: "3px solid rgba(212,175,55,0.5)",
                background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative",
                boxShadow: "0 0 30px rgba(212,175,55,0.2)",
              }}
              onClick={() => fileRef.current?.click()}
            >
              {form.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36 }}>👤</div>
                  <p style={{ fontSize: 11, color: "rgba(248,244,236,0.4)", marginTop: 4 }}>Adicionar foto</p>
                </div>
              )}
              {uploading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="spinner" />
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadPhoto(file); }}
            />

            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
              📷 {form.avatar_url ? "Trocar foto" : "Escolher foto"}
            </button>

            <p style={{ fontSize: 12, color: "rgba(248,244,236,0.35)", textAlign: "center", lineHeight: 1.5 }}>
              Foto opcional, mas perfis com foto recebem muito mais atenção!
            </p>

            {form.avatar_url && (
              <p style={{ fontSize: 12, color: "#4ade80", textAlign: "center" }}>
                ✅ Foto cadastrada com sucesso!
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {step > 1 && (
            <button type="button" className="btn-ghost" onClick={() => setStep((s) => (s - 1) as Step)} style={{ flex: 1 }}>
              ← Voltar
            </button>
          )}
          {step < 4 ? (
            <button type="button" className="btn-gold" onClick={() => setStep((s) => (s + 1) as Step)} style={{ flex: 2 }}>
              Continuar →
            </button>
          ) : (
            <button type="button" className="btn-gold" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Salvando...</>
              ) : "✨ Concluir perfil"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "rgba(248,244,236,0.7)", marginBottom: 6, letterSpacing: "0.3px",
};
