"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { InlineBanner } from "@/components/ui/Badges";

type Periode = "tout" | "aujourdhui" | "semaine" | "mois";

function debutPeriode(periode: Periode): string | null {
  const now = new Date();
  if (periode === "aujourdhui") {
    return new Date(now.setHours(0, 0, 0, 0)).toISOString().slice(0, 10);
  }
  if (periode === "semaine") {
    const jour = now.getDay() || 7;
    const lundi = new Date(now);
    lundi.setDate(now.getDate() - jour + 1);
    return lundi.toISOString().slice(0, 10);
  }
  if (periode === "mois") {
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  }
  return null;
}

export function SoldeManager() {
  const supabase = createClient();
  const [soldeInitial, setSoldeInitial] = useState(0);
  const [totalEncaissements, setTotalEncaissements] = useState(0);
  const [totalDecaissements, setTotalDecaissements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<Periode>("tout");

  const [modalOpen, setModalOpen] = useState(false);
  const [nouveauSolde, setNouveauSolde] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const debut = debutPeriode(periode);

    let encQuery = supabase.from("encaissements").select("montant");
    let decQuery = supabase.from("decaissements").select("montant");
    if (debut) {
      encQuery = encQuery.gte("date_operation", debut);
      decQuery = decQuery.gte("date_operation", debut);
    }

    const [encRes, decRes, paramRes] = await Promise.all([
      encQuery,
      decQuery,
      supabase
        .from("parametres_generaux")
        .select("valeur")
        .eq("cle", "solde_caisse_initial")
        .maybeSingle(),
    ]);

    setTotalEncaissements(
      (encRes.data ?? []).reduce((s, e) => s + e.montant, 0)
    );
    setTotalDecaissements(
      (decRes.data ?? []).reduce((s, d) => s + d.montant, 0)
    );
    if (paramRes.data?.valeur) setSoldeInitial(Number(paramRes.data.valeur) || 0);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleModifierSolde(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(nouveauSolde);
    if (Number.isNaN(val)) {
      setError("Valeur invalide.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("parametres_generaux")
      .update({ valeur: String(val) })
      .eq("cle", "solde_caisse_initial");
    setSaving(false);
    if (error) {
      setError(
        logSupabaseError(
          { table: "parametres_generaux", operation: "update" },
          error,
          "Impossible de mettre à jour le solde initial. Réessayez."
        )
      );
      return;
    }
    setModalOpen(false);
    load();
  }

  const soldeActuel =
    periode === "tout"
      ? soldeInitial + totalEncaissements - totalDecaissements
      : totalEncaissements - totalDecaissements;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
            Solde de caisse
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Solde initial + encaissements − décaissements.
          </p>
        </div>
        {periode === "tout" && (
          <SecondaryButton
            onClick={() => {
              setNouveauSolde(String(soldeInitial));
              setError(null);
              setModalOpen(true);
            }}
            className="shrink-0"
          >
            <Pencil size={15} />
            Solde initial
          </SecondaryButton>
        )}
      </div>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-lg bg-onyx-50 p-1">
        {(
          [
            { id: "tout", label: "Depuis le début" },
            { id: "aujourdhui", label: "Aujourd'hui" },
            { id: "semaine", label: "Cette semaine" },
            { id: "mois", label: "Ce mois" },
          ] as { id: Periode; label: string }[]
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriode(p.id)}
            className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
              periode === p.id
                ? "bg-white text-onyx-900 shadow-sm"
                : "text-onyx-500 hover:text-onyx-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-onyx-400">
          Chargement...
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-onyx-100 bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
            <p className="mt-3 text-xl font-semibold text-emerald-600">
              {totalEncaissements.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-onyx-400">Encaissements (FCFA)</p>
          </div>

          <div className="rounded-xl border border-onyx-100 bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <TrendingDown size={18} />
            </div>
            <p className="mt-3 text-xl font-semibold text-red-500">
              {totalDecaissements.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-onyx-400">Décaissements (FCFA)</p>
          </div>

          <div className="rounded-xl border border-onyx-900 bg-onyx-900 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent-400">
              <Wallet size={18} />
            </div>
            <p className="mt-3 text-xl font-semibold text-white">
              {soldeActuel.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-onyx-300">
              {periode === "tout" ? "Solde actuel" : "Variation sur la période"}{" "}
              (FCFA)
            </p>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title="Modifier le solde initial" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleModifierSolde} className="space-y-4">
            {error && <InlineBanner message={error} />}
            <p className="text-sm text-onyx-500">
              Ce montant représente la trésorerie disponible avant le début
              de l&apos;utilisation de l&apos;application.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-onyx-700">
                Solde initial (FCFA)
              </label>
              <input
                type="number"
                step="1"
                required
                value={nouveauSolde}
                onChange={(e) => setNouveauSolde(e.target.value)}
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
                Enregistrer
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
