// Mirrors the check inside admin_get_stats()/admin_list_users()
// themselves (the real gate — this is UI-level only) — app_metadata is
// set on the account via direct SQL (see supabase-admin-role.sql), never
// user-editable, and comes straight off the verified JWT, so this never
// needs its own query.
export function isAdmin(
  claims: { app_metadata?: Record<string, unknown> } | null | undefined,
): boolean {
  return claims?.app_metadata?.role === "admin";
}
