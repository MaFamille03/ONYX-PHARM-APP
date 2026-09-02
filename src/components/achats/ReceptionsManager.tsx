"use client";

import { useEffect, useState, useCallback } from "react";
import { PackageCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/errors";
import { PrimaryButton } from "@/components/ui/Buttons";
import { InlineBanner } from "@/components/ui/Badges";

type LigneEnAttente = {
  id: string;
  achat_id: string;
  quantite: number;
  articles: { designation: string } | null;
  emplacements: { nom: string } | null;
  achats: { reference: string; fournisseurs: { nom: string } | null } | null;
};

export function ReceptionsManager() {
  const supabase = createClient();
  const [lignes, setLignes] = useState<LigneEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lignes_achats")
      .select(
        "id, achat_id, quantite, articles(designation), emplacements:emplacement_destination_id(nom), achats(reference, statut, fournisseurs(nom))"
      )
      .eq("recu", false);

    if (!error && data) {
      const filtrees = (data as unknown as (LigneEnAttente & {
        achats: { statut: string } | null;
      })[]).filter((l) =>
        ["Validé", "Partiellement payé", "Payé"].includes(
          l.achats?.statut ?? ""
        )
      );
      setLignes(filtrees);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function receptionner(ligneId: string) {
    setBusyId(ligneId);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.rpc("receptionner_ligne_achat", {
      p_ligne_id: ligneId,
      p_utilisateur_id: user?.id ?? null,
    });

    setBusyId(null);
    if (error) {
      setError(
        logSupabaseError(
          { table: "lignes_achats", operation: "rpc receptionner_ligne_achat" },
          error,
          "Impossible de réceptionner cette ligne. Réessayez."
        )
      );
      return;
    }
    load();
  }

  // Regroupe les lignes par achat pour un affichage plus lisible
  const parAchat = lignes.reduce<Record<string, LigneEnAttente[]>>((acc, l) => {
    acc[l.achat_id] = acc[l.achat_id] || [];
    acc[l.achat_id].push(l);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Réceptions
      </h1>
      <p className="mt-1 text-sm text-onyx-500">
        Achats validés en attente d&apos;entrée en stock.
      </p>

      {error && (
        <div className="mt-3">
          <InlineBanner message={error} />
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : Object.keys(parAchat).length === 0 ? (
          <div className="rounded-xl border border-dashed border-onyx-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-onyx-600">
              Rien à réceptionner pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(parAchat).map(([achatId, lignesAchat]) => (
              <div
                key={achatId}
                className="rounded-xl border border-onyx-100 bg-white p-4"
              >
                <p className="text-sm font-semibold text-onyx-800">
                  {lignesAchat[0].achats?.reference} —{" "}
                  {lignesAchat[0].achats?.fournisseurs?.nom}
                </p>
                <div className="mt-3 space-y-2">
                  {lignesAchat.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-lg bg-onyx-50/50 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-onyx-700">
                          {l.articles?.designation}
                        </p>
                        <p className="text-xs text-onyx-400">
                          {l.quantite} unité{l.quantite > 1 ? "s" : ""} →{" "}
                          {l.emplacements?.nom}
                        </p>
                      </div>
                      <PrimaryButton
                        onClick={() => receptionner(l.id)}
                        loading={busyId === l.id}
                        className="min-h-0 px-3 py-1.5 text-xs"
                      >
                        <PackageCheck size={14} />
                        Réceptionner
                      </PrimaryButton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
