import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Coffeedex collects and why.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-heading font-semibold">
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Coffeedex is a proof-of-concept coffee shop collection app for
          Stockholm. This page explains what data is collected and why, kept
          deliberately short while the app itself is a POC.
        </p>
        <h2 className="pt-2 text-lg font-heading font-semibold">Account data</h2>
        <p>
          If you sign up, your email and authentication session are stored by
          Supabase, our backend provider. Your visited coffee shops are stored
          against your account and are only ever visible to you.
        </p>
        <h2 className="pt-2 text-lg font-heading font-semibold">
          Analytics
        </h2>
        <p>
          We use PostHog for product analytics — which pages get used, so we
          can improve the app. This only runs if you click &quot;Accept&quot;
          on the cookie banner. You can change your mind at any time via the
          &quot;Cookie preferences&quot; link in the footer.
        </p>
        <h2 className="pt-2 text-lg font-heading font-semibold">
          Location
        </h2>
        <p>
          If you grant browser location permission, your device&apos;s
          position is used locally (to sort nearby shops, or show a
          &quot;you&apos;re here&quot; nudge) and is not stored on our
          servers.
        </p>
      </div>
    </main>
  );
}
