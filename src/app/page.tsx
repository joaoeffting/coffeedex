import { redirect } from "next/navigation";

// No standalone landing page, and no auth branch either — /discover
// already works read-only for signed-out visitors (browse the map, with
// "Log in to track visits" prompts built into the pins themselves), so
// it doubles as the pitch. Login only comes up once someone actually
// tries to mark a shop visited.
export default function Home() {
  redirect("/discover");
}
