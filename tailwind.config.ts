import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: "#FFE97D",
          400: "#FFD700",
          500: "#D4AF37",
          600: "#B8960C",
        },
        heaven: {
          light: "#FFFBEB",
          mid: "#FEF3C7",
          glow: "#FCD34D",
        },
        hell: {
          light: "#FEE2E2",
          mid: "#DC2626",
          glow: "#EF4444",
        },
        midnight: {
          800: "#0F1629",
          900: "#080D1A",
          950: "#040810",
        },
        parchment: "#FFF8F0",
        sacred: "#8B5CF6",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "heaven-gradient":
          "linear-gradient(to bottom, #FFF8E7, #FFFBF0, #FEF9EC)",
        "hell-gradient": "linear-gradient(to bottom, #1a0000, #3d0000, #1a0000)",
        "celestial-gradient":
          "radial-gradient(ellipse at top, #1e2a5e 0%, #080D1A 60%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "ascend": "ascend 0.6s ease-in forwards",
        "descend": "descend 0.6s ease-in forwards",
        "heaven-glow": "heavenGlow 0.4s ease-out forwards",
        "hell-glow": "hellGlow 0.4s ease-out forwards",
        "star-twinkle": "twinkle 3s ease-in-out infinite",
        "halo-spin": "haloSpin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(212,175,55,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(212,175,55,0.7)" },
        },
        ascend: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-120vh) rotate(-5deg)", opacity: "0" },
        },
        descend: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(120vh) rotate(5deg)", opacity: "0" },
        },
        heavenGlow: {
          "0%": { boxShadow: "0 0 0px rgba(253,211,77,0)" },
          "100%": { boxShadow: "0 0 60px rgba(253,211,77,0.8), 0 0 120px rgba(255,255,255,0.3)" },
        },
        hellGlow: {
          "0%": { boxShadow: "0 0 0px rgba(220,38,38,0)" },
          "100%": { boxShadow: "0 0 60px rgba(220,38,38,0.8), 0 0 120px rgba(239,68,68,0.3)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.8)" },
        },
        haloSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      boxShadow: {
        "golden": "0 0 30px rgba(212,175,55,0.4)",
        "divine": "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.2)",
        "card": "0 25px 50px rgba(0,0,0,0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
