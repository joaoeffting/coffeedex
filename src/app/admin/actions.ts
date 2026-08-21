"use server";

import { createClient } from "@/utils/supabase/server";

const ADMIN_EMAIL = "joaoeffting@gmail.com";

export type AdminUserRow = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

// Defense in depth alongside admin_list_users()'s own email check — the
// DB function is the real gate (it'd reject any other caller outright),
// this just avoids a round-trip for the common "not admin" case.
export async function listUsers(): Promise<
  { ok: true; users: AdminUserRow[] } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || data?.claims.email !== ADMIN_EMAIL) {
    return { ok: false, error: "Not authorized" };
  }

  const { data: users, error } = await supabase.rpc("admin_list_users");
  if (error) return { ok: false, error: error.message };

  return { ok: true, users: users as unknown as AdminUserRow[] };
}
