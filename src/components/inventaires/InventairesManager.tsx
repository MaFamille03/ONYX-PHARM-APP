"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/FormControls";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { InlineBanner, StatutBadge } from "@/components/ui/Badges";
import { useReferenceData } from "@/lib/hooks/useReferenceData";

type InventaireRow = {
  id: string;
  reference: string;
  statut: string;
  created_at: string;
  emplacements: { nom: string } | null;
};

type LigneRow = {
  id: string;
  article_id: string;
  quantite_theorique: number;
  quantite_reelle: number;
  ecart: number;
  observation: string | null;
  articles: { designation: string } | null;
};

export function InventairesManager() {
  const supabase = createClient();
  const { emplacements } = useReferenceData();
  const emplacementsActifs = emplacements.filter((e) => e.actif);

  const [inventaires, setInventaires] = useState<InventaireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ouvert, setOuvert] = useState<InventaireRow | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [emplacementId, setEmplacementId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventaires")
      .select("id, reference, statut, created_at, emplacements(nom)")
      .order("created_at", { ascending: false });
    if (data) setInventaires(data as unknown as InventaireRow[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!emplacementId) {
      setError("Choisissez un emplacement.");
      return;
    }
    setCreating(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: refData, error: refError } = await supabase.rpc(
      "generer_numero_document",
      { p_prefixe: "INV" }
    );
    if (refError || !refData) {
      setError("Impossible de générer la référence.");
      setCreating(false);
      return;
    }

    const { data: inventaire, error: invError } = await supabase
      .from("inventaires")
      .insert({
        reference: refData,
        emplacement_id: emplacementId,
        statut: "Brouillon",
        created_by: user?.id ?? null,
      })
      .select("id, reference, statut, created_at, emplacements(nom)")
      .single();

    if (invError || !inventaire) {
      setError("Impossible de créer l'inventaire.");
      setCreating(false);
      return;
    }

    const { data: articles } = await supabase
      .from("articles")
      .select("id, stocks(emplacement_id, quantite)")
      .eq("statut", "Actif");

    if (articles && articles.length > 0) {
      const lignes = (
        articles as unknown as {
          id: string;
          stocks: { emplacement_id: string; quantite: number }[];
        }[]
      ).map((a) => {
        const theorique =
          a.stocks.find((s) => s.emplacement_id === emplacementId)
            ?.quantite ?? 0;
        return {
          inventaire_id: inventaire.id,
          article_id: a.id,
          quantite_theorique: theorique,
          quantite_reelle: theorique,
        };
      });
      await supabase.from("inventaire_lignes").insert(lignes);
    }

    setCreating(false);
    setModalOpen(false);
    load();
    setOuvert(inventaire as unknown as InventaireRow);
  }

  if (ouvert) {
    return (
      <InventaireDetail
        inventaire={ouvert}
        onBack={() => {
          setOuvert(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
            Inventaires
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Comptez le stock réel par emplacement et ajustez les écarts.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setEmplacementId("");
            setError(null);
            setModalOpen(true);
          }}
          className="shrink-0"
        >
          <Plus size={17} />
          Nouvel inventaire
        </PrimaryButton>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : inventaires.length === 0 ? (
          <div className="rounded-xl border border-dashed border-onyx-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-onyx-600">
              Aucun inventaire pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {inventaires.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setOuvert(inv)}
                className="flex w-full items-center justify-between rounded-xl border border-onyx-100 bg-white p-4 text-left hover:bg-onyx-50/50"
              >
                <div>
                  <p className="font-medium text-onyx-900">
                    {inv.reference} — {inv.emplacements?.nom}
                  </p>
                  <p className="text-xs text-onyx-400">
                    {new Date(inv.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <StatutBadge statut={inv.statut} />
              </button>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="Nouvel inventaire" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <InlineBanner message={error} />}
            <SelectField
              id="emplacement-inventaire"
              label="Emplacement à inventorier"
              value={emplacementId}
              onChange={(e) => setEmplacementId(e.target.value)}
              required
            >
              <option value="">— Sélectionner —</option>
              {emplacementsActifs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </SelectField>
            <p className="text-xs text-onyx-400">
              Toutes les quantités théoriques actuelles seront chargées
              automatiquement ; vous n&apos;aurez plus qu&apos;à saisir les
              quantités réellement comptées.
            </p>
            <div className="flex gap-3 pt-2">
              <SecondaryButton
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit" loading={creating} className="flex-1">
                Démarrer l&apos;inventaire
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function InventaireDetail({
  inventaire,
  onBack,
}: {
  inventaire: InventaireRow;
  onBack: () => void;
}) {
  const supabase = createClient();
  const [lignes, setLignes] = useState<LigneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modifs, setModifs] = useState<Record<string, string>>({});

  const estBrouillon = inventaire.statut === "Brouillon";

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventaire_lignes")
      .select(
        "id, article_id, quantite_theorique, quantite_reelle, ecart, observation, articles(designation)"
      )
      .eq("inventaire_id", inventaire.id)
      .order("id");
    if (data) setLignes(data as unknown as LigneRow[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventaire.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function enregistrerComptages() {
    setSaving(true);
    setError(null);
    const entries = Object.entries(modifs);
    for (const [ligneId, valeur] of entries) {
      await supabase
        .from("inventaire_lignes")
        .update({ quantite_reelle: Number(valeur) })
        .eq("id", ligneId);
    }
    setModifs({});
    setSaving(false);
    load();
  }

  async function validerInventaire() {
    if (Object.keys(modifs).length > 0) {
      await enregistrerComptages();
    }
    setValidating(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.rpc("valider_inventaire", {
      p_inventaire_id: inventaire.id,
      p_utilisateur_id: user?.id ?? null,
    });

    setValidating(false);

    if (error) {
      setError("Impossible de valider l'inventaire.");
      return;
    }

    onBack();
  }

  const totalEcarts = lignes.filter((l) => {
    const val =
      modifs[l.id] !== undefined ? Number(modifs[l.id]) : l.quantite_reelle;
    return val !== l.quantite_theorique;
  }).length;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-onyx-500 hover:text-onyx-800"
      >
        <ArrowLeft size={16} />
        Retour aux inventaires
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-onyx-900 sm:text-2xl">
            {inventaire.reference}
            <StatutBadge statut={inventaire.statut} />
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Emplacement : {inventaire.emplacements?.nom} · {totalEcarts} écart
            {totalEcarts !== 1 ? "s" : ""} détecté{totalEcarts !== 1 ? "s" : ""}
          </p>
        </div>

        {estBrouillon && (
          <div className="flex gap-2">
            <SecondaryButton
              onClick={enregistrerComptages}
              loading={saving}
              disabled={Object.keys(modifs).length === 0}
            >
              Enregistrer les comptages
            </SecondaryButton>
            <PrimaryButton onClick={validerInventaire} loading={validating}>
              <CheckCircle2 size={16} />
              Valider l&apos;inventaire
            </PrimaryButton>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <InlineBanner message={error} />
        </div>
      )}

      {!estBrouillon && (
        <div className="mt-3">
          <InlineBanner
            type="success"
            message="Cet inventaire a été validé : le stock a été ajusté en conséquence."
          />
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-onyx-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-onyx-100 bg-onyx-50/50 text-left text-xs font-medium uppercase tracking-wide text-onyx-400">
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3 text-right">Théorique</th>
                  <th className="px-4 py-3 text-right">Réel</th>
                  <th className="px-4 py-3 text-right">Écart</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => {
                  const valeurAffichee =
                    modifs[l.id] !== undefined
                      ? modifs[l.id]
                      : String(l.quantite_reelle);
                  const ecartAffiche =
                    Number(valeurAffichee) - l.quantite_theorique;
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-onyx-50 last:border-0"
                    >
                      <td className="px-4 py-2.5 font-medium text-onyx-800">
                        {l.articles?.designation}
                      </td>
                      <td className="px-4 py-2.5 text-right text-onyx-500">
                        {l.quantite_theorique}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {estBrouillon ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={valeurAffichee}
                            onChange={(e) =>
                              setModifs({ ...modifs, [l.id]: e.target.value })
                            }
                            className="w-20 rounded-md border border-onyx-200 px-2 py-1 text-right text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                          />
                        ) : (
                          l.quantite_reelle
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={`font-medium ${
                            ecartAffiche === 0
                              ? "text-onyx-400"
                              : ecartAffiche > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                          }`}
                        >
                          {ecartAffiche > 0 ? "+" : ""}
                          {ecartAffiche}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
