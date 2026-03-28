"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/discover", icon: "✨", label: "Descobrir" },
  { href: "/matches",  icon: "💛", label: "Matches"  },
  { href: "/profile",  icon: "👤", label: "Perfil"   },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 500,
        borderRadius: "20px 20px 0 0",
        padding: "10px 0 env(safe-area-inset-bottom, 10px)",
        display: "flex",
        // Trocamos de space-around para center/flex-start porque o flex: 1 fará a distribuição
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 50,
        borderBottom: "none",
      }}
    >
      {navItems.map(({ href, icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{ 
              textDecoration: "none",
              flex: 1, // ✨ O SEGREDO ESTÁ AQUI: Força todos a terem a mesma largura (33.3%)
              display: "flex",
              justifyContent: "center" // Centraliza o conteúdo dentro da sua fatia de 33%
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 0", // Removi o padding horizontal para não estourar caixas pequenas
                borderRadius: 12,
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  filter: active ? "none" : "grayscale(0.4) opacity(0.6)",
                  transition: "filter 0.2s, transform 0.2s",
                  transform: active ? "scale(1.1)" : "scale(1)",
                }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: "0.5px",
                  color: active ? "#FFD700" : "rgba(248,244,236,0.45)",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </span>
              {active && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    background: "#FFD700",
                    borderRadius: "50%",
                    boxShadow: "0 0 8px #FFD700",
                  }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}