"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/FormControls";
import { ArticleSelect } from "@/components/articles/ArticleSelect";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { InlineBanner } from "@/components/ui/Badges";
import { useReferenceData } from "@/lib/hooks/useReferenceData";

type TransfertRow = {
  id: string;
  reference: string;
  quantite: number;
  statut: string;
  observation: string | null;
  created_at: string;
  articles: { designation: string } | null;
  source: { nom: string } | null;
  destination: { nom: string } | null;
};

export function TransfertsManager() {
  const supabase = createClient();
  const { emplacements } = useReferenceData();
  const emplacementsActifs = emplacements.filter((e) => e.actif);

  const [transferts, setTransferts] = useState<TransfertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [articleId, setArticleId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [observation, setObservation] = useState("");
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transferts")
      .select(
        "id, reference, quantite, statut, observation, created_at, articles(designation), source:emplacements!transferts_emplacement_source_id_fkey(nom), destination:emplacements!transferts_emplacement_destination_id_fkey(nom)"
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setTransferts(data as unknown as TransfertRow[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!articleId || !sourceId) {
      setStockDisponible(null);
      return;
    }
    supabase
      .from("stocks")
      .select("quantite")
      .eq("article_id", articleId)
      .eq("emplacement_id", sourceId)
      .maybeSingle()
      .then(({ data }) => setStockDisponible(data?.quantite ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, sourceId]);

  function openCreate() {
    setArticleId("");
    setSourceId("");
    setDestinationId("");
    setQuantite("");
    setObservation("");
    setStockDisponible(null);
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!articleId || !sourceId || !destinationId) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (sourceId === destinationId) {
      setError("La source et la destination doivent être différentes.");
      return;
    }
    const qte = Number(quantite);
    if (!qte || qte <= 0) {
      setError("La quantité doit être supérieure à zéro.");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.rpc("effectuer_transfert", {
      p_article_id: articleId,
      p_source_id: sourceId,
      p_destination_id: destinationId,
      p_quantite: qte,
      p_observation: observation.trim() || null,
      p_utilisateur_id: user?.id ?? null,
    });

    setSaving(false);

    if (error) {
      setError(
        error.message.includes("Stock insuffisant")
          ? error.message
          : logSupabaseError(
              { table: "transferts", operation: "rpc effectuer_transfert" },
              error,
              "Impossible d'effectuer ce transfert. Réessayez."
            )
      );
      return;
    }

    setModalOpen(false);
    load();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
            Transferts
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Déplacez du stock d&apos;un emplacement à un autre.
          </p>
        </div>
        <PrimaryButton onClick={openCreate} className="shrink-0">
          <Plus size={17} />
          Nouveau transfert
        </PrimaryButton>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : transferts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-onyx-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-onyx-600">
              Aucun transfert pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transferts.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-onyx-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-onyx-400">
                    {t.reference}
                  </span>
                  <span className="text-xs text-onyx-400">
                    {new Date(t.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="mt-1 font-medium text-onyx-900">
                  {t.articles?.designation}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-onyx-500">
                  <span>{t.source?.nom}</span>
                  <ArrowRight size={14} className="text-onyx-300" />
                  <span>{t.destination?.nom}</span>
                  <span className="ml-auto font-semibold text-onyx-800">
                    {t.quantite}
                  </span>
                </div>
                {t.observation && (
                  <p className="mt-1.5 text-xs text-onyx-400">
                    {t.observation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="Nouveau transfert" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <InlineBanner message={error} />}

            <ArticleSelect value={articleId} onChange={setArticleId} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="source"
                label="Depuis"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
              >
                <option value="">— Emplacement source —</option>
                {emplacementsActifs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </SelectField>

              <SelectField
                id="destination"
                label="Vers"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
              >
                <option value="">— Emplacement destination —</option>
                {emplacementsActifs
                  .filter((e) => e.id !== sourceId)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
              </SelectField>
            </div>

            {stockDisponible !== null && (
              <p className="text-xs text-onyx-400">
                Stock disponible à la source : {stockDisponible}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-onyx-700">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="w-full rounded-lg border border-onyx-200 px-3.5 py-2.5 text-[15px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-onyx-700">
                Observation (optionnel)
              </label>
              <input
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full rounded-lg border border-onyx-200 px-3.5 py-2.5 text-[15px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <SecondaryButton
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit" loading={saving} className="flex-1">
                Transférer
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
