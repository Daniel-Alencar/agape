// ─────────────────────────────────────────────
// Database Types (Supabase)
// ─────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  birth_date: string;
  gender: "masculino" | "feminino";
  looking_for: "masculino" | "feminino" | "ambos";
  city: string;
  state: string;
  church?: string;
  denomination?: string;
  bio?: string;
  avatar_url?: string;
  photos?: string[];
  interests?: string[];
  verse?: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: "heaven" | "hell";
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  // joined
  other_profile?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// Supabase Database Generic Type
// ─────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      swipes: {
        Row: Swipe;
        Insert: Omit<Swipe, "id" | "created_at">;
        Update: Partial<Swipe>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at">;
        Update: Partial<Match>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Message>;
      };
    };
  };
};

// ─────────────────────────────────────────────
// UI / App Types
// ─────────────────────────────────────────────

export type SwipeDirection = "heaven" | "hell" | null;

export interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}

export const CHRISTIAN_INTERESTS = [
  "Louvor & Adoração",
  "Estudo Bíblico",
  "Missões",
  "Oração",
  "Dança Gospel",
  "Teatro Cristão",
  "Voluntariado",
  "Grupos de Jovens",
  "Retiros Espirituais",
  "Evangelismo",
  "Música Instrumental",
  "Leitura Bíblica",
  "Células",
  "Acampamentos",
  "Coral da Igreja",
];

export const DENOMINATIONS = [
  "Assembleia de Deus",
  "Batista",
  "Presbiteriana",
  "Metodista",
  "Adventista",
  "Católica",
  "Luterana",
  "Universal",
  "Internacional da Graça",
  "Quadrangular",
  "Sara Nossa Terra",
  "Renascer em Cristo",
  "Cristã Maranata",
  "Outra",
];

export const BIBLE_VERSES = [
  "\"Porque Deus amou o mundo de tal maneira...\" — João 3:16",
  "\"Tudo posso naquele que me fortalece\" — Filipenses 4:13",
  "\"O SENHOR é o meu pastor\" — Salmos 23:1",
  "\"Buscai primeiro o Reino de Deus\" — Mateus 6:33",
  "\"O amor é paciente, o amor é bondoso\" — 1 Coríntios 13:4",
  "\"Porque eu sei os planos que tenho para vós\" — Jeremias 29:11",
  "\"Confie no Senhor de todo o seu coração\" — Provérbios 3:5",
];
