"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { SwipeCard } from "@/components/SwipeCard";
import { MatchModal } from "@/components/MatchModal";
import { ProfileDetailModal } from "@/components/ProfileDetailModal";
import { BottomNav } from "@/components/BottomNav";

export default function DiscoverPage() {
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // 1. Correção: "profiles" as any
      const { data: profile } = await supabase
        .from("profiles" as any).select("*").eq("id", user.id).single();

      // 2. Correção: (profile as Profile).is_complete
      if (!profile || !(profile as Profile).is_complete) { router.push("/setup"); return; }
      
      setMyProfile(profile as Profile);
      await loadCandidates(user.id, profile as Profile);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadCandidates(userId: string, profile: Profile) {
    const supabase = createClient();
    
    // 3. Correção: "swipes" as any
    const { data: swiped } = await supabase
      .from("swipes" as any).select("swiped_id").eq("swiper_id", userId);
      
    const swipedIds = swiped?.map((s: { swiped_id: string }) => s.swiped_id) ?? [];

    // 4. Correção: "profiles" as any
    let query = supabase
      .from("profiles" as any)
      .select("*")
      .neq("id", userId)
      .eq("is_complete", true)
      .limit(20);

    if (profile.looking_for !== "ambos") {
      query = query.eq("gender", profile.looking_for);
    }
    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`);
    }

    const { data } = await query;
    const shuffled = ((data as Profile[]) ?? []).sort(() => Math.random() - 0.5);
    setCandidates(shuffled);
  }

  const handleSwipe = useCallback(
    async (direction: "heaven" | "hell") => {
      if (!myProfile || candidates.length === 0) return;
      const target = candidates[0];
      const supabase = createClient();

      // 5. Correção: "swipes" as any
      await supabase.from("swipes" as any).upsert({
        swiper_id: myProfile.id,
        swiped_id: target.id,
        direction,
      } as any);

      setSwipeCount((c) => c + 1);

      if (direction === "heaven") {
        // 6. Correção: "swipes" as any
        const { data: theirSwipe } = await supabase
          .from("swipes" as any).select("id")
          .eq("swiper_id", target.id).eq("swiped_id", myProfile.id)
          .eq("direction", "heaven").single();
          
        if (theirSwipe) {
          setTimeout(() => setMatchedProfile(target), 300);
        }
      }

      setCandidates((prev) => prev.slice(1));
    },
    [myProfile, candidates]
  );

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(248,244,236,0.6)", fontStyle: "italic" }}>
          Buscando almas abençoadas...
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", paddingBottom: 72, position: "relative", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, lineHeight: 1 }} className="gold-shimmer">
            Ágape
          </h1>
          <p style={{ fontSize: 11, color: "rgba(248,244,236,0.4)", marginTop: 1 }}>
            {candidates.length} jovens por perto
          </p>
        </div>
        <div className="glass" style={{ padding: "6px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>✝️</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{swipeCount}</span>
        </div>
      </div>

      {/* Swipe direction hint */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "0 20px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(248,244,236,0.45)", fontSize: 11 }}>
          <span>↑</span>
          <span style={{ fontWeight: 700, color: "#FFD700", opacity: 0.8 }}>CÉU</span>
          <span style={{ fontSize: 13 }}>✨</span>
        </div>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(248,244,236,0.45)", fontSize: 11 }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontWeight: 700, color: "#DC2626", opacity: 0.8 }}>INFERNO</span>
          <span>↓</span>
        </div>
      </div>

      {/* Card Stack */}
      <div style={{ flex: 1, position: "relative", margin: "0 16px", minHeight: 0 }}>
        {candidates.length === 0 ? (
          <EmptyState onRefresh={() => { if (myProfile) loadCandidates(myProfile.id, myProfile); }} />
        ) : (
          candidates.slice(0, 3).reverse().map((profile, reverseIdx) => {
            const stackIndex = 2 - reverseIdx;
            return (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onSwipe={handleSwipe}
                isTop={stackIndex === 0}
                stackIndex={stackIndex}
                onShowProfile={setDetailProfile}
              />
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      {candidates.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, padding: "12px 20px", flexShrink: 0 }}>
          {/* Hell */}
          <button
            onClick={() => handleSwipe("hell")}
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(220,38,38,0.13)",
              border: "2px solid rgba(220,38,38,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, cursor: "pointer", transition: "all 0.2s",
              flexDirection: "column",
            }}
            title="Inferno"
          >
            🔥
          </button>

          {/* Info / See profile */}
          <button
            onClick={() => setDetailProfile(candidates[0])}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, cursor: "pointer", transition: "all 0.2s",
            }}
            title="Ver perfil completo"
          >
            📖
          </button>

          {/* Heaven */}
          <button
            onClick={() => handleSwipe("heaven")}
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(212,175,55,0.13)",
              border: "2px solid rgba(212,175,55,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 0 15px rgba(212,175,55,0.2)",
            }}
            title="Céu"
          >
            ✨
          </button>
        </div>
      )}

      {/* Modals */}
      {detailProfile && (
        <ProfileDetailModal
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onSwipe={(dir) => { setDetailProfile(null); handleSwipe(dir); }}
        />
      )}

      {matchedProfile && myProfile && (
        <MatchModal
          matchedProfile={matchedProfile}
          myProfile={myProfile}
          onClose={() => setMatchedProfile(null)}
          onMessage={() => { setMatchedProfile(null); router.push("/matches"); }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16, textAlign: "center", padding: 24,
      }}
    >
      <div className="dove-float" style={{ fontSize: 52 }}>🕊️</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "rgba(248,244,236,0.8)" }}>
        Você viu todos por hoje!
      </h3>
      <p style={{ fontSize: 14, color: "rgba(248,244,236,0.45)", maxWidth: 260, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
        &ldquo;Aquele que espera no Senhor renova as suas forças.&rdquo;<br />
        <span style={{ fontSize: 12 }}>— Isaías 40:31</span>
      </p>
      <button className="btn-gold" onClick={onRefresh} style={{ marginTop: 8 }}>
        🔄 Verificar novos perfis
      </button>
    </div>
  );
}