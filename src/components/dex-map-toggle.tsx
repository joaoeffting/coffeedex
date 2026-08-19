import Link from "next/link";

export function DexMapToggle({ active }: { active: "dex" | "map" }) {
  return (
    <div className="dex-outline flex overflow-hidden rounded-full">
      <Link
        href="/dex"
        className={
          active === "dex"
            ? "bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            : "bg-card px-4 py-1.5 text-sm font-semibold hover:bg-muted"
        }
      >
        Dex
      </Link>
      <Link
        href="/discover"
        className={
          active === "map"
            ? "bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            : "bg-card px-4 py-1.5 text-sm font-semibold hover:bg-muted"
        }
      >
        Map
      </Link>
    </div>
  );
}
