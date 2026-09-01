import { createClient } from "@/lib/supabase/server";
import { UserCog } from "lucide-react";

export default async function UtilisateursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dateCreation = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Utilisateurs
      </h1>
      <p className="mt-1 text-sm text-onyx-500">
        Chaque compte identifie précisément son titulaire pour assurer la
        traçabilité des opérations.
      </p>

      <div className="mt-6 max-w-lg rounded-xl border border-onyx-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-onyx-900 text-white">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-onyx-800">
              {user?.email ?? "—"}
            </p>
            <p className="text-xs text-onyx-400">Compte créé le {dateCreation}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-onyx-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-onyx-700">
          Liste des utilisateurs et gestion des comptes
        </p>
        <p className="mt-1 max-w-sm text-sm text-onyx-400">
          La liste complète des comptes de l&apos;équipe, avec traçabilité des
          créations/modifications, sera développée avec le module Historique
          (étape 9).
        </p>
      </div>
    </div>
  );
}
