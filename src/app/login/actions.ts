"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?tab=signup&error=${encodeURIComponent(error.message)}`);
  }

  // Whether this lands with a live session depends on the project's
  // "Confirm email" setting (prod has it on; dev has it off for faster
  // local iteration) — signUp() returns a session immediately when
  // confirmation isn't required, and null when it is. Branch on what
  // actually came back rather than assuming either way.
  if (data.session) {
    redirect("/account");
  }
  redirect("/check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
