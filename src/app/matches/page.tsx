"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Profile, Match, Message } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type MatchWithProfile = Match & { other_profile: Profile; last_message?: Message };

export default function MatchesPage() {
  const router = useRouter();
  const [myId, setMyId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<MatchWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setMyId(user.id);
      await loadMatches(user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  async function loadMatches(userId: string) {
    const supabase = createClient();

    const { data: rawMatches } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!rawMatches) return;

    const enriched: MatchWithProfile[] = await Promise.all(
      rawMatches.map(async (m: Match) => {
        const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherId)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...m,
          other_profile: otherProfile as Profile,
          last_message: lastMsg as Message | undefined,
        };
      })
    );

    setMatches(enriched);
  }

  async function openChat(match: MatchWithProfile) {
    setActiveMatch(match);
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function sendMessage() {
    if (!input.trim() || !activeMatch || !myId) return;
    setSending(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        match_id: activeMatch.id,
        sender_id: myId,
        content: input.trim(),
        read: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao enviar mensagem");
    } else {
      setMessages((prev) => [...prev, data as Message]);
      setInput("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setSending(false);
  }

  const getAge = (birthDate: string) => {
    const dob = new Date(birthDate);
    let age = new Date().getFullYear() - dob.getFullYear();
    if (new Date().getMonth() - dob.getMonth() < 0) age--;
    return age;
  };

  if (loading) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
      </div>
    );
  }

  // ─── Chat view ───
  if (activeMatch) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Chat header */}
        <div
          className="glass"
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            borderRadius: 0,
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
          }}
        >
          <button
            onClick={() => { setActiveMatch(null); loadMatches(myId!); }}
            style={{
              background: "none",
              border: "none",
              color: "#FFD700",
              fontSize: 20,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ←
          </button>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(212,175,55,0.5)",
              flexShrink: 0,
            }}
          >
            {activeMatch.other_profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeMatch.other_profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1e2a5e", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
            )}
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#F8F4EC" }}>
              {activeMatch.other_profile.full_name.split(" ")[0]}
            </p>
            <p style={{ fontSize: 11, color: "rgba(248,244,236,0.45)", margin: 0 }}>
              {activeMatch.other_profile.church || activeMatch.other_profile.denomination || "Cristão(ã)"}
            </p>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 18 }}>🕊️</span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 16px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", margin: "auto", padding: "32px 24px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✝️</div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18,
                  color: "rgba(248,244,236,0.5)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                Uma nova conexão abençoada!
                <br />
                <span style={{ fontSize: 14 }}>Diga olá para {activeMatch.other_profile.full_name.split(" ")[0]} 😊</span>
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === myId;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe
                      ? "linear-gradient(135deg, #D4AF37, #FFD700)"
                      : "rgba(255,255,255,0.1)",
                    color: isMe ? "#0A0E1A" : "#F8F4EC",
                    fontSize: 14,
                    lineHeight: 1.5,
                    fontWeight: isMe ? 600 : 400,
                    boxShadow: isMe
                      ? "0 4px 12px rgba(212,175,55,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {msg.content}
                  <div style={{ fontSize: 10, opacity: 0.55, marginTop: 3, textAlign: "right" }}>
                    {formatDistanceToNow(new Date(msg.created_at), { locale: ptBR, addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="glass"
          style={{
            padding: "10px 14px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexShrink: 0,
            borderRadius: 0,
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="divine-input"
            style={{ flex: 1, margin: 0 }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="btn-gold"
            style={{ padding: "10px 16px", borderRadius: 12, flexShrink: 0, opacity: !input.trim() ? 0.5 : 1 }}
          >
            {sending ? "..." : "✉️"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Matches list ───
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", paddingBottom: 72 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", flexShrink: 0 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1,
          }}
          className="gold-shimmer"
        >
          Suas Conexões
        </h1>
        <p style={{ fontSize: 12, color: "rgba(248,244,236,0.4)", marginTop: 3 }}>
          {matches.length} match{matches.length !== 1 ? "es" : ""} abençoado{matches.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {matches.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 14,
              textAlign: "center",
              padding: 24,
            }}
          >
            <div className="dove-float" style={{ fontSize: 44 }}>🕊️</div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                color: "rgba(248,244,236,0.7)",
              }}
            >
              Nenhum match ainda
            </h3>
            <p style={{ fontSize: 13, color: "rgba(248,244,236,0.4)", lineHeight: 1.6, maxWidth: 240, fontStyle: "italic", fontFamily: "Cormorant Garamond, serif" }}>
              Continue descobrindo jovens e logo Deus enviará a conexão certa ✝️
            </p>
            <button className="btn-gold" onClick={() => router.push("/discover")}>
              ✨ Descobrir jovens
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => openChat(match)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 18,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,175,55,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.15)";
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(212,175,55,0.4)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {match.other_profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={match.other_profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#1e2a5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#F8F4EC", margin: "0 0 2px" }}>
                    {match.other_profile.full_name.split(" ")[0]},{" "}
                    <span style={{ fontWeight: 400, color: "rgba(248,244,236,0.6)", fontSize: 14 }}>
                      {getAge(match.other_profile.birth_date)}
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(248,244,236,0.45)",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {match.last_message
                      ? match.last_message.content
                      : match.other_profile.church || "Diga olá! 👋"}
                  </p>
                </div>

                {/* Time */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "rgba(248,244,236,0.3)", margin: 0 }}>
                    {formatDistanceToNow(new Date(match.created_at), { locale: ptBR, addSuffix: false })}
                  </p>
                  <span style={{ fontSize: 16 }}>💛</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
