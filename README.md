# ✝️ Ágape — Conexões Abençoadas

> Um app de conexões cristãs para jovens da igreja, com mecânica de swipe vertical (Céu ↑ / Inferno ↓), autenticação Supabase, banco de dados, chat e muito mais.

---

## 🌟 Funcionalidades

- **Swipe vertical**: Arraste para **cima (Céu ✨)** para interesse, para **baixo (Inferno 🔥)** para rejeitar
- **Match automático**: Quando dois usuários se curtem mutuamente, um match é criado com animação especial
- **Chat**: Mensagens entre matches
- **Perfil completo**: Foto, biografia, versículo favorito, denominação, interesses cristãos
- **Autenticação**: Registro + login com email/senha via Supabase Auth
- **Design celestial**: Fundo estrelado, tons dourados, tipografia elegante

---

## 🚀 Como Configurar

### 1. Criar projeto no Supabase

Acesse [app.supabase.com](https://app.supabase.com) e crie um novo projeto.

### 2. Executar o schema SQL

No painel do Supabase, vá em **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/schema.sql
```

### 3. Criar o bucket de storage

No painel do Supabase, vá em **Storage** → **New Bucket**:
- **Nome**: `avatars`
- **Public**: ✅ Sim

Depois, adicione esta policy no bucket:
```sql
CREATE POLICY "Upload avatar público"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Leitura pública de avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 4. Configurar variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

As chaves estão em: **Supabase → Settings → API**

### 5. Configurar URL de redirecionamento

Em **Supabase → Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 6. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/page.tsx    # Tela de login
│   │   ├── register/page.tsx # Cadastro
│   │   └── callback/route.ts # Callback de email
│   ├── setup/page.tsx        # Configuração de perfil (4 passos)
│   ├── discover/page.tsx     # Tela principal de swipe ⬆️⬇️
│   ├── matches/page.tsx      # Lista de matches + chat
│   └── profile/page.tsx      # Perfil próprio
├── components/
│   ├── SwipeCard.tsx         # Card com mecânica de drag
│   ├── MatchModal.tsx        # Celebração de match com confetti
│   ├── BottomNav.tsx         # Navegação inferior
│   └── StarsBackground.tsx   # Fundo estrelado animado
└── lib/
    ├── supabase.ts           # Cliente Supabase
    └── types.ts              # Tipos TypeScript + constantes
```

---

## 🎨 Design

- **Paleta**: Azul meia-noite + dourado + tons pergaminho
- **Tipografia**: Cormorant Garamond (display) + Nunito (corpo)
- **Efeitos**: Glassmorphism, partículas, estrelas cintilantes, halos
- **Swipe**: CSS transforms + Pointer Events API (funciona touch & mouse)

---

## 🙏 Créditos

Desenvolvido com amor e fé.  
*"O amor é paciente, o amor é bondoso"* — 1 Coríntios 13:4
