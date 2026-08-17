import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

// Small async Server Component just for this check, so the rest of the
// header (a plain sync component) doesn't need to become async too.
export async function NavAuthLinks() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <Button size="sm" render={<Link href="/login">Log in</Link>} />
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      render={<Link href="/account">Account</Link>}
    />
  );
}
