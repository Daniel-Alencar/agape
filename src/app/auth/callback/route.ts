import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"; // Import opcional para precisão

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // Adicionamos a tipagem aqui para evitar o 'implicit any'
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // O método setAll pode ser chamado em Server Components onde 
              // a escrita de cookies às vezes é restrita. O bloco try/catch evita quebras.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/setup`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}