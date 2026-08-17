import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";

export default async function AccountPage() {
  const supabase = await createClient();
  // getClaims() (not getSession()) round-trips to Supabase's auth server to
  // verify the token is genuinely valid — session data read straight off
  // the cookie hasn't been independently re-checked, so it's the wrong
  // thing to gate access on.
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/login");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Your account</h1>
        <p className="text-muted-foreground">{data.claims.email}</p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full">
          Log out
        </Button>
      </form>
    </main>
  );
}
