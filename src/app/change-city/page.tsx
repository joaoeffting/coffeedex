import type { Metadata } from "next";
import Link from "next/link";
import { ChangeCityPicker } from "@/components/change-city-picker";
import { getCities } from "@/lib/get-cities";

export const metadata: Metadata = {
  title: "Change City",
};

export default async function ChangeCityPage() {
  const cities = await getCities();

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Change City</h1>
        <p className="text-muted-foreground">
          Pick a city — you&apos;ll go straight to its Dex, and coffeedex
          will remember this choice next time you visit.
        </p>
      </div>

      <ChangeCityPicker cities={cities} />

      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back home
      </Link>
    </main>
  );
}
