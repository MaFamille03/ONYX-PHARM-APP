import { createClient } from "@/lib/supabase/server";
import { TableauDeBordManager } from "@/components/dashboard/TableauDeBordManager";
import { TableauDeBordWithOnboarding } from "@/components/dashboard/TableauDeBordWithOnboarding";

export default async function TableauDeBordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nomUtilisateur: string | null = null;
  let presentationVue = true;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nom_complet, presentation_vue")
      .eq("id", user.id)
      .maybeSingle();
    nomUtilisateur =
      profile?.nom_complet || user.email?.split("@")[0] || null;
    presentationVue = profile?.presentation_vue ?? true;
  }

  return (
    <TableauDeBordWithOnboarding presentationVueInitiale={presentationVue}>
      <TableauDeBordManager nomUtilisateur={nomUtilisateur} />
    </TableauDeBordWithOnboarding>
  );
}
