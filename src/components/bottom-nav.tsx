import { createClient } from "@/utils/supabase/server";
import { BottomNavBar } from "@/components/bottom-nav-bar";

// Small async Server Component just for the auth check, same split as
// NavAuthLinks — keeps the interactive bar (active-tab highlighting) in
// its own Client Component below.
export async function BottomNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return <BottomNavBar isLoggedIn={data?.claims != null} />;
}
