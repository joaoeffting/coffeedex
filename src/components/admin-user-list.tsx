"use client";

import { useState, useTransition } from "react";
import { listUsers, type AdminUserRow } from "@/app/admin/actions";

// Loaded on demand, not on page load — actual emails are more sensitive
// than the aggregate counts above, so this round-trips to the server
// only once someone deliberately asks for it.
export function AdminUserList() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reveal() {
    setError(null);
    startTransition(async () => {
      const result = await listUsers();
      if (result.ok) setUsers(result.users);
      else setError(result.error);
    });
  }

  if (users == null) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={reveal}
          disabled={isPending}
          className="dex-outline dex-press rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Loading…" : "Show registered users"}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b-2 border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Email</th>
            <th className="py-2 pr-3 font-medium">Joined</th>
            <th className="py-2 pr-3 font-medium">Last sign in</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border/50">
              <td className="py-2 pr-3">{user.email}</td>
              <td className="py-2 pr-3">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 pr-3">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
