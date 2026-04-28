import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/crm/app-shell";
import { logoutAction } from "@/app/(app)/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell userEmail={user.email ?? "Unknown user"} logout={logoutAction}>
      {children}
    </AppShell>
  );
}
