import Link from "next/link";

export function DexMapToggle({
  citySlug,
  active,
}: {
  citySlug: string;
  active: "dex" | "map";
}) {
  return (
    <div className="dex-outline flex overflow-hidden rounded-full">
      <Link
        href={`/dex/${citySlug}`}
        className={
          active === "dex"
            ? "bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            : "bg-card px-4 py-1.5 text-sm font-semibold hover:bg-muted"
        }
      >
        Dex
      </Link>
      <Link
        href={`/discover/${citySlug}`}
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
