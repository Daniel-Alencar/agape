import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { StarsBackground } from "@/components/StarsBackground";

export const metadata: Metadata = {
  title: "Ágape — Conexões Abençoadas",
  description:
    "Encontre seu parceiro de fé. Conexões cristãs que começam com propósito.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✝️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <StarsBackground />
        <main
          style={{ position: "relative", zIndex: 1, height: "100%" }}
        >
          {children}
        </main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0F1629",
              color: "#F8F4EC",
              border: "1px solid rgba(212,175,55,0.4)",
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#FFD700", secondary: "#0F1629" },
            },
            error: {
              iconTheme: { primary: "#DC2626", secondary: "#F8F4EC" },
            },
          }}
        />
      </body>
    </html>
  );
}
