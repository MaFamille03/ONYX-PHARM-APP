"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/FormControls";
import { PrimaryButton } from "@/components/ui/Buttons";
import { InlineBanner } from "@/components/ui/Badges";

type DetteRow = {
  achat_id: string;
  reference: string;
  fournisseur_id: string;
  montant_total: number;
  montant_paye: number;
  dette: number;
};

type PaiementRow = {
  id: string;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  achats: { reference: string; fournisseurs: { nom: string } | null } | null;
};

export function PaiementsAchatsManager() {
  const supabase = createClient();
  const [dettes, setDettes] = useState<(DetteRow & { fournisseur_nom: string })[]>(
    []
  );
  const [paiements, setPaiements] = useState<PaiementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAchat, setModalAchat] = useState<
    (DetteRow & { fournisseur_nom: string }) | null
  >(null);
  const [montant, setMontant] = useState("");
  const [mode, setMode] = useState("Espèces");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [dettesRes, paiementsRes] = await Promise.all([
      supabase
        .from("v_dettes_fournisseurs")
        .select("achat_id, reference, fournisseur_id, montant_total, montant_paye, dette"),
      supabase
        .from("paiements_achats")
        .select("id, montant, mode_paiement, date_paiement, achats(reference, fournisseurs(nom))")
        .order("date_paiement", { ascending: false })
        .limit(50),
    ]);

    if (dettesRes.data) {
      const fournisseurIds = Array.from(
        new Set(dettesRes.data.map((d) => d.fournisseur_id))
      );
      const { data: fournisseurs } = await supabase
        .from("fournisseurs")
        .select("id, nom")
        .in("id", fournisseurIds);
      const nomsMap = new Map(
        (fournisseurs ?? []).map((f) => [f.id, f.nom])
      );
      setDettes(
        dettesRes.data.map((d) => ({
          ...d,
          fournisseur_nom: nomsMap.get(d.fournisseur_id) ?? "—",
        }))
      );
    }
    if (paiementsRes.data)
      setPaiements(paiementsRes.data as unknown as PaiementRow[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function ouvrirPaiement(dette: DetteRow & { fournisseur_nom: string }) {
    setModalAchat(dette);
    setMontant(String(dette.dette));
    setMode("Espèces");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalAchat) return;
    const val = Number(montant);
    if (!val || val <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (val > modalAchat.dette) {
      setError(
        `Le montant dépasse la dette restante (${modalAchat.dette.toLocaleString("fr-FR")} FCFA).`
      );
      return;
    }

    setSaving(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("paiements_achats").insert({
      achat_id: modalAchat.achat_id,
      montant: val,
      mode_paiement: mode,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (error) {
      setError(
        logSupabaseError(
          { table: "paiements_achats", operation: "insert" },
          error,
          "Impossible d'enregistrer ce paiement. Réessayez."
        )
      );
      return;
    }
    setModalAchat(null);
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Paiements d&apos;achats
      </h1>
      <p className="mt-1 text-sm text-onyx-500">
        Dettes fournisseurs en cours et historique des règlements.
      </p>

      {loading ? (
        <p className="py-10 text-center text-sm text-onyx-400">
          Chargement...
        </p>
      ) : (
        <>
          <h2 className="mt-6 text-sm font-semibold text-onyx-800">
            Dettes en cours ({dettes.length})
          </h2>
          {dettes.length === 0 ? (
            <p className="mt-2 text-sm text-onyx-400">
              Aucune dette fournisseur en cours.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {dettes.map((d) => (
                <div
                  key={d.achat_id}
                  className="flex items-center justify-between rounded-lg border border-onyx-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-onyx-800">
                      {d.reference} — {d.fournisseur_nom}
                    </p>
                    <p className="text-xs text-red-500">
                      Reste dû : {d.dette.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <PrimaryButton
                    onClick={() => ouvrirPaiement(d)}
                    className="min-h-0 px-3 py-1.5 text-xs"
                  >
                    <CreditCard size={14} />
                    Payer
                  </PrimaryButton>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-8 text-sm font-semibold text-onyx-800">
            Historique des paiements
          </h2>
          {paiements.length === 0 ? (
            <p className="mt-2 text-sm text-onyx-400">
              Aucun paiement enregistré.
            </p>
          ) : (
            <div className="mt-2 overflow-hidden rounded-xl border border-onyx-100 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-onyx-100 bg-onyx-50/50 text-left text-xs font-medium uppercase tracking-wide text-onyx-400">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Achat</th>
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-onyx-50 last:border-0"
                    >
                      <td className="px-4 py-2.5 text-onyx-500">
                        {new Date(p.date_paiement).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2.5 text-onyx-700">
                        {p.achats?.reference}
                      </td>
                      <td className="px-4 py-2.5 text-onyx-500">
                        {p.achats?.fournisseurs?.nom}
                      </td>
                      <td className="px-4 py-2.5 text-onyx-500">
                        {p.mode_paiement}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-onyx-800">
                        {p.montant.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modalAchat && (
        <Modal
          title={`Paiement — ${modalAchat.reference}`}
          onClose={() => setModalAchat(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <InlineBanner message={error} />}
            <p className="text-sm text-onyx-500">
              Fournisseur :{" "}
              <span className="font-medium text-onyx-800">
                {modalAchat.fournisseur_nom}
              </span>
              <br />
              Reste dû :{" "}
              <span className="font-medium text-onyx-800">
                {modalAchat.dette.toLocaleString("fr-FR")} FCFA
              </span>
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-onyx-700">
                Montant
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full rounded-lg border border-onyx-200 px-3.5 py-2.5 text-[15px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>
            <SelectField
              id="mode-paiement-dette"
              label="Mode de paiement"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="Espèces">Espèces</option>
              <option value="Banque">Banque</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Autre">Autre</option>
            </SelectField>
            <PrimaryButton type="submit" loading={saving} className="w-full">
              Enregistrer le paiement
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
}
