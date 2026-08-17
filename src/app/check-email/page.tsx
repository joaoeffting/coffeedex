import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="font-heading text-2xl font-semibold">Check your email</h1>
      <p className="text-muted-foreground">
        We sent a confirmation link to the address you signed up with. Click
        it to activate your account, then come back and log in.
      </p>
      <Link href="/login" className="text-sm underline underline-offset-4">
        Back to log in
      </Link>
    </main>
  );
}
