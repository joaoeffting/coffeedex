import type { Metadata } from "next";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, signup } from "./actions";

export const metadata: Metadata = {
  title: "Log in",
};

const TAB_VALUES = ["login", "signup"] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { tab, error } = await searchParams;
  const initialTab = TAB_VALUES.includes(tab as (typeof TAB_VALUES)[number])
    ? (tab as (typeof TAB_VALUES)[number])
    : "login";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Coffeedex</h1>

      <Tabs defaultValue={initialTab}>
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Log in
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Sign up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          <form action={login} className="space-y-4">
            {error && initialTab === "login" && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="dex-outline w-full" size="lg">
              Log in
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-4">
          <form action={signup} className="space-y-4">
            {error && initialTab === "signup" && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="dex-outline w-full" size="lg">
              Sign up
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          ← Back home
        </Link>
      </p>
    </main>
  );
}
