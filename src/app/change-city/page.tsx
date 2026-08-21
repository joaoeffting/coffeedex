import type { Metadata } from "next";
import Link from "next/link";
import { ChangeCityPicker } from "@/components/change-city-picker";
import { getCities } from "@/lib/get-cities";

export const metadata: Metadata = {
  title: "Change City",
  robots: { index: false, follow: false },
};

const RETURN_SECTIONS = ["dex", "discover", "saved"] as const;

export default async function ChangeCityPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const cities = await getCities();
  const { from } = await searchParams;
  const returnSection = RETURN_SECTIONS.includes(
    from as (typeof RETURN_SECTIONS)[number],
  )
    ? (from as (typeof RETURN_SECTIONS)[number])
    : "dex";

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Change City</h1>
        <p className="text-muted-foreground">
          Pick a city — you&apos;ll go straight back to where you were, for
          that city, and coffeedex will remember this choice next time you
          visit.
        </p>
      </div>

      <ChangeCityPicker cities={cities} returnSection={returnSection} />

      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
      >
        ← Back home
      </Link>
    </main>
  );
}
