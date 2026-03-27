-- ============================================================
-- ÁGAPE - Schema do Banco de Dados (Supabase)
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABELA: profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT NOT NULL,
  birth_date    DATE NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino')),
  looking_for   TEXT NOT NULL CHECK (looking_for IN ('masculino', 'feminino', 'ambos')),
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  church        TEXT,
  denomination  TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  photos        TEXT[] DEFAULT '{}',
  interests     TEXT[] DEFAULT '{}',
  verse         TEXT,   -- versículo favorito
  is_complete   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABELA: swipes (curtidas / recusas)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swipes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  swiped_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  direction   TEXT NOT NULL CHECK (direction IN ('heaven', 'hell')), -- heaven = curtiu, hell = recusou
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- ─────────────────────────────────────────────
-- TABELA: matches
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- ─────────────────────────────────────────────
-- TABELA: messages (chat básico)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id   UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- FUNÇÃO: criar match automaticamente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Só verifica se foi um swipe "heaven"
  IF NEW.direction = 'heaven' THEN
    -- Verifica se a outra pessoa também deu "heaven"
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND direction = 'heaven'
    ) THEN
      -- Cria o match (com user_ids em ordem para evitar duplicatas)
      INSERT INTO public.matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_swipe_insert
AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION check_and_create_match();

-- ─────────────────────────────────────────────
-- FUNÇÃO: atualizar updated_at automaticamente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Perfis públicos para leitura"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Usuário edita próprio perfil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuário insere próprio perfil"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies: swipes
CREATE POLICY "Usuário vê seus próprios swipes"
  ON public.swipes FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Usuário insere seus próprios swipes"
  ON public.swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Policies: matches
CREATE POLICY "Usuário vê seus matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Policies: messages
CREATE POLICY "Usuário vê mensagens de seus matches"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Usuário envia mensagens em seus matches"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────
-- STORAGE BUCKET: avatars
-- ─────────────────────────────────────────────
-- Execute no painel do Supabase > Storage > New Bucket
-- Nome: "avatars", Public: true

-- ─────────────────────────────────────────────
-- ÍNDICES para performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_swipes_swiper   ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped   ON public.swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1   ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2   ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match  ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
