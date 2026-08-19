import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AnalyticsConsentBanner } from "@/components/analytics-consent-banner";
import { CookiePreferencesLink } from "@/components/cookie-preferences-link";
import { PostHogPageview } from "@/components/posthog-pageview";
import { NavAuthLinks } from "@/components/nav-auth-links";
import { IosInstallPrompt } from "@/components/ios-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rounded, chunky display font for headings — the playful "Pokédex" feel
// the reference moodboard uses on titles like "Gotta catch 'em all".
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coffeedex — Collect a City's Coffee Shops",
    template: "%s · Coffeedex",
  },
  description:
    "A Pokédex-style collection game for real coffee shops: visit a cafe, mark it visited, and watch your personal album fill in — one city at a time.",
  openGraph: {
    title: "Coffeedex — Collect a City's Coffee Shops",
    description:
      "A Pokédex-style collection game for real coffee shops: visit a cafe, mark it visited, and watch your personal album fill in — one city at a time.",
    url: siteUrl,
    siteName: "Coffeedex",
    locale: "en_US",
    type: "website",
  },
  appleWebApp: {
    title: "Coffeedex",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageview />
          </Suspense>
          <header className="border-b-2 border-border px-4 py-3">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <Link href="/" className="font-heading text-lg font-semibold">
                ☕ Coffeedex
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/dex"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dex
                </Link>
                <Link
                  href="/change-city"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Change City
                </Link>
                <Suspense fallback={null}>
                  <NavAuthLinks />
                </Suspense>
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="border-t-2 border-border bg-secondary/40 px-4 py-6 text-center text-xs text-muted-foreground">
            <p>
              Coffeedex — a coffee shop collection.{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </Link>{" "}
              · <CookiePreferencesLink />
            </p>
          </footer>
          <AnalyticsConsentBanner />
          <IosInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
