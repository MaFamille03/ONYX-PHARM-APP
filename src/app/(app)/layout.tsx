import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le middleware protège déjà ces routes ; ce contrôle est une deuxième
  // ligne de défense côté serveur (défense en profondeur).
  if (!user) {
    redirect("/connexion");
  }

  return <AppShell userEmail={user.email ?? null}>{children}</AppShell>;
}
