"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ArrowLeft, Trash2, CreditCard, XCircle, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/FormControls";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { InlineBanner, StatutBadge } from "@/components/ui/Badges";
import { FournisseurSelect } from "@/components/tiers/FournisseurSelect";
import { useReferenceData } from "@/lib/hooks/useReferenceData";
import { SecondPasswordModal } from "@/components/securite/SecondPasswordModal";
import { DocumentImprimable } from "@/components/documents/DocumentImprimable";

type AchatRow = {
  id: string;
  reference: string;
  date_achat: string;
  montant_total: number;
  montant_paye: number;
  statut: string;
  fournisseurs: { nom: string } | null;
};

type ArticleOption = { id: string; designation: string; prix_achat: number };

type LigneBrouillon = {
  article_id: string;
  designation: string;
  quantite: string;
  prix_achat_unitaire: string;
  emplacement_destination_id: string;
};

export function AchatsManager() {
  const [vue, setVue] = useState<"liste" | "creation" | "detail">("liste");
  const [achatOuvertId, setAchatOuvertId] = useState<string | null>(null);

  if (vue === "creation") {
    return (
      <NouvelAchat
        onCancel={() => setVue("liste")}
        onCreated={(id) => {
          setAchatOuvertId(id);
          setVue("detail");
        }}
      />
    );
  }

  if (vue === "detail" && achatOuvertId) {
    return <AchatDetail achatId={achatOuvertId} onBack={() => setVue("liste")} />;
  }

  return (
    <ListeAchats
      onCreate={() => setVue("creation")}
      onOpen={(id) => {
        setAchatOuvertId(id);
        setVue("detail");
      }}
    />
  );
}

function ListeAchats({
  onCreate,
  onOpen,
}: {
  onCreate: () => void;
  onOpen: (id: string) => void;
}) {
  const supabase = createClient();
  const [achats, setAchats] = useState<AchatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("achats")
      .select(
        "id, reference, date_achat, montant_total, montant_paye, statut, fournisseurs(nom)"
      )
      .order("created_at", { ascending: false });
    if (data) setAchats(data as unknown as AchatRow[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
            Achats
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Commandes fournisseurs et suivi des règlements.
          </p>
        </div>
        <PrimaryButton onClick={onCreate} className="shrink-0">
          <Plus size={17} />
          Nouvel achat
        </PrimaryButton>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : achats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-onyx-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-onyx-600">
              Aucun achat pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {achats.map((a) => {
              const reste = a.montant_total - a.montant_paye;
              return (
                <button
                  key={a.id}
                  onClick={() => onOpen(a.id)}
                  className="flex w-full flex-col gap-1 rounded-xl border border-onyx-100 bg-white p-4 text-left hover:bg-onyx-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-onyx-900">
                      {a.reference} — {a.fournisseurs?.nom}
                    </p>
                    <p className="text-xs text-onyx-400">
                      {new Date(a.date_achat).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-semibold text-onyx-800">
                        {a.montant_total.toLocaleString("fr-FR")} FCFA
                      </p>
                      {reste > 0 && (
                        <p className="text-xs text-red-500">
                          Reste : {reste.toLocaleString("fr-FR")}
                        </p>
                      )}
                    </div>
                    <StatutBadge statut={a.statut} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function NouvelAchat({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (id: string) => void;
}) {
  const supabase = createClient();
  const { emplacements } = useReferenceData();
  const emplacementsActifs = emplacements.filter((e) => e.actif);

  const [fournisseurId, setFournisseurId] = useState("");
  const [dateAchat, setDateAchat] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [articlesOptions, setArticlesOptions] = useState<ArticleOption[]>([]);
  const [lignes, setLignes] = useState<LigneBrouillon[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, designation, prix_achat")
      .eq("statut", "Actif")
      .order("designation")
      .then(({ data }) => {
        if (data) setArticlesOptions(data as ArticleOption[]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ajouterLigne() {
    setLignes([
      ...lignes,
      {
        article_id: "",
        designation: "",
        quantite: "1",
        prix_achat_unitaire: "",
        emplacement_destination_id: emplacementsActifs[0]?.id ?? "",
      },
    ]);
  }

  function majLigne(index: number, patch: Partial<LigneBrouillon>) {
    setLignes(lignes.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function supprimerLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index));
  }

  function choisirArticle(index: number, articleId: string) {
    const article = articlesOptions.find((a) => a.id === articleId);
    majLigne(index, {
      article_id: articleId,
      designation: article?.designation ?? "",
      prix_achat_unitaire: article ? String(article.prix_achat) : "",
    });
  }

  const montantTotal = lignes.reduce(
    (sum, l) =>
      sum + (Number(l.quantite) || 0) * (Number(l.prix_achat_unitaire) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fournisseurId) {
      setError("Choisissez un fournisseur.");
      return;
    }
    if (lignes.length === 0) {
      setError("Ajoutez au moins un article.");
      return;
    }
    for (const l of lignes) {
      if (!l.article_id || !l.quantite || Number(l.quantite) <= 0) {
        setError("Chaque ligne doit avoir un article et une quantité valide.");
        return;
      }
      if (!l.emplacement_destination_id) {
        setError("Chaque ligne doit avoir un emplacement de destination.");
        return;
      }
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: refData, error: refError } = await supabase.rpc(
      "generer_numero_document",
      { p_prefixe: "ACH" }
    );
    if (refError || !refData) {
      setError(
        logSupabaseError(
          { table: "numero_sequences", operation: "rpc generer_numero_document" },
          refError,
          "Impossible de générer la référence. Réessayez."
        )
      );
      setSaving(false);
      return;
    }

    const { data: achat, error: achatError } = await supabase
      .from("achats")
      .insert({
        reference: refData,
        fournisseur_id: fournisseurId,
        date_achat: dateAchat,
        montant_total: montantTotal,
        statut: "Brouillon",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();

    if (achatError || !achat) {
      setError(
        logSupabaseError(
          { table: "achats", operation: "insert" },
          achatError,
          "Impossible de créer l'achat. Réessayez."
        )
      );
      setSaving(false);
      return;
    }

    const { error: lignesError } = await supabase.from("lignes_achats").insert(
      lignes.map((l) => ({
        achat_id: achat.id,
        article_id: l.article_id,
        emplacement_destination_id: l.emplacement_destination_id,
        quantite: Number(l.quantite),
        prix_achat_unitaire: Number(l.prix_achat_unitaire) || 0,
      }))
    );

    setSaving(false);

    if (lignesError) {
      setError(
        "L'achat a été créé mais les lignes n'ont pas pu être enregistrées."
      );
      return;
    }

    onCreated(achat.id);
  }

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-onyx-500 hover:text-onyx-800"
      >
        <ArrowLeft size={16} />
        Retour aux achats
      </button>

      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Nouvel achat
      </h1>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {error && <InlineBanner message={error} />}

        <div className="grid grid-cols-1 gap-4 rounded-xl border border-onyx-100 bg-white p-4 sm:grid-cols-2">
          <FournisseurSelect value={fournisseurId} onChange={setFournisseurId} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-onyx-700">
              Date d&apos;achat
            </label>
            <input
              type="date"
              required
              value={dateAchat}
              onChange={(e) => setDateAchat(e.target.value)}
              className="w-full rounded-lg border border-onyx-200 px-3.5 py-2.5 text-[15px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            />
          </div>
        </div>

        <div className="rounded-xl border border-onyx-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-onyx-800">Articles</h2>
            <SecondaryButton
              type="button"
              onClick={ajouterLigne}
              className="min-h-0 px-3 py-1.5 text-xs"
            >
              <Plus size={14} />
              Ajouter une ligne
            </SecondaryButton>
          </div>

          {lignes.length === 0 ? (
            <p className="mt-3 text-sm text-onyx-400">Aucun article ajouté.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {lignes.map((l, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-onyx-100 bg-onyx-50/40 p-3 sm:grid-cols-12 sm:items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="mb-1 block text-xs font-medium text-onyx-500">
                      Article
                    </label>
                    <select
                      value={l.article_id}
                      onChange={(e) => choisirArticle(i, e.target.value)}
                      required
                      className="w-full rounded-md border border-onyx-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                    >
                      <option value="">— Article —</option>
                      {articlesOptions.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-onyx-500">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={l.quantite}
                      onChange={(e) => majLigne(i, { quantite: e.target.value })}
                      className="w-full rounded-md border border-onyx-200 px-2.5 py-2 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-onyx-500">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={l.prix_achat_unitaire}
                      onChange={(e) =>
                        majLigne(i, { prix_achat_unitaire: e.target.value })
                      }
                      className="w-full rounded-md border border-onyx-200 px-2.5 py-2 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-onyx-500">
                      Destination
                    </label>
                    <select
                      value={l.emplacement_destination_id}
                      onChange={(e) =>
                        majLigne(i, {
                          emplacement_destination_id: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-md border border-onyx-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                    >
                      {emplacementsActifs.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between sm:col-span-1 sm:justify-center">
                    <span className="text-xs text-onyx-400 sm:hidden">
                      Sous-total :{" "}
                      {(
                        (Number(l.quantite) || 0) *
                        (Number(l.prix_achat_unitaire) || 0)
                      ).toLocaleString("fr-FR")}
                    </span>
                    <button
                      type="button"
                      onClick={() => supprimerLigne(i)}
                      className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Supprimer la ligne"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end border-t border-onyx-100 pt-3">
            <p className="text-sm font-semibold text-onyx-800">
              Total : {montantTotal.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <SecondaryButton type="button" onClick={onCancel} className="flex-1">
            Annuler
          </SecondaryButton>
          <PrimaryButton type="submit" loading={saving} className="flex-1">
            Créer l&apos;achat
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

function AchatDetail({
  achatId,
  onBack,
}: {
  achatId: string;
  onBack: () => void;
}) {
  const supabase = createClient();
  const [achat, setAchat] = useState<AchatRow | null>(null);
  const [lignes, setLignes] = useState<
    {
      id: string;
      quantite: number;
      prix_achat_unitaire: number;
      montant_ligne: number;
      recu: boolean;
      articles: { designation: string } | null;
      emplacements: { nom: string } | null;
    }[]
  >([]);
  const [paiements, setPaiements] = useState<
    { id: string; montant: number; mode_paiement: string; date_paiement: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [paiementModalOpen, setPaiementModalOpen] = useState(false);
  const [montantPaiement, setMontantPaiement] = useState("");
  const [modePaiement, setModePaiement] = useState("Espèces");
  const [annulationModalOpen, setAnnulationModalOpen] = useState(false);
  const [impressionOpen, setImpressionOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [achatRes, lignesRes, paiementsRes] = await Promise.all([
      supabase
        .from("achats")
        .select(
          "id, reference, date_achat, montant_total, montant_paye, statut, fournisseurs(nom)"
        )
        .eq("id", achatId)
        .single(),
      supabase
        .from("lignes_achats")
        .select(
          "id, quantite, prix_achat_unitaire, montant_ligne, recu, articles(designation), emplacements:emplacement_destination_id(nom)"
        )
        .eq("achat_id", achatId),
      supabase
        .from("paiements_achats")
        .select("id, montant, mode_paiement, date_paiement")
        .eq("achat_id", achatId)
        .order("date_paiement", { ascending: false }),
    ]);

    if (achatRes.data) setAchat(achatRes.data as unknown as AchatRow);
    if (lignesRes.data) setLignes(lignesRes.data as unknown as typeof lignes);
    if (paiementsRes.data) setPaiements(paiementsRes.data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achatId]);

  useEffect(() => {
    load();
  }, [load]);

  async function validerAchat() {
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("achats")
      .update({ statut: "Validé" })
      .eq("id", achatId);
    setBusy(false);
    if (error) {
      setError(
        logSupabaseError(
          { table: "achats", operation: "update (validation)" },
          error,
          "Impossible de valider cet achat. Réessayez."
        )
      );
    } else load();
  }

  async function annulerAchat() {
    const dejaRecu = lignes.some((l) => l.recu);
    if (dejaRecu || paiements.length > 0) {
      setError(
        "Impossible d'annuler : des réceptions ou paiements existent déjà sur cet achat."
      );
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("achats")
      .update({ statut: "Annulé" })
      .eq("id", achatId);
    setBusy(false);
    if (error) {
      setError(
        logSupabaseError(
          { table: "achats", operation: "update (annulation brouillon)" },
          error,
          "Impossible d'annuler cet achat. Réessayez."
        )
      );
    } else load();
  }

  async function annulerAchatAvecMotDePasse(motDePasse: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.rpc("annuler_achat", {
      p_achat_id: achatId,
      p_second_mdp: motDePasse,
      p_utilisateur_id: user?.id ?? null,
    });

    if (error) {
      throw new Error(
        error.message.includes("Mot de passe")
          ? "Mot de passe de sécurité incorrect."
          : error.message.includes("déjà été utilisé")
            ? error.message
            : "Impossible d'annuler cet achat."
      );
    }

    setAnnulationModalOpen(false);
    load();
  }

  async function handleAjouterPaiement(e: React.FormEvent) {
    e.preventDefault();
    if (!achat) return;
    const montant = Number(montantPaiement);
    const reste = achat.montant_total - achat.montant_paye;
    if (!montant || montant <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (montant > reste) {
      setError(
        `Le montant dépasse le reste à payer (${reste.toLocaleString("fr-FR")} FCFA).`
      );
      return;
    }

    setBusy(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("paiements_achats").insert({
      achat_id: achatId,
      montant,
      mode_paiement: modePaiement,
      created_by: user?.id ?? null,
    });

    setBusy(false);
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
    setPaiementModalOpen(false);
    setMontantPaiement("");
    load();
  }

  if (loading || !achat) {
    return (
      <p className="py-10 text-center text-sm text-onyx-400">Chargement...</p>
    );
  }

  const reste = achat.montant_total - achat.montant_paye;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-onyx-500 hover:text-onyx-800"
      >
        <ArrowLeft size={16} />
        Retour aux achats
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-onyx-900 sm:text-2xl">
            {achat.reference}
            <StatutBadge statut={achat.statut} />
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            {achat.fournisseurs?.nom} ·{" "}
            {new Date(achat.date_achat).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="flex gap-2">
          {achat.statut === "Brouillon" && (
            <>
              <SecondaryButton onClick={annulerAchat} loading={busy}>
                Annuler
              </SecondaryButton>
              <PrimaryButton onClick={validerAchat} loading={busy}>
                Valider l&apos;achat
              </PrimaryButton>
            </>
          )}
          {achat.statut !== "Brouillon" && (
            <SecondaryButton onClick={() => setImpressionOpen(true)}>
              <Printer size={16} />
              Imprimer
            </SecondaryButton>
          )}
          {achat.statut !== "Brouillon" && achat.statut !== "Annulé" && (
            <SecondaryButton onClick={() => setAnnulationModalOpen(true)}>
              <XCircle size={16} />
              Annuler l&apos;achat
            </SecondaryButton>
          )}
          {achat.statut !== "Brouillon" && achat.statut !== "Annulé" && reste > 0 && (
            <PrimaryButton
              onClick={() => {
                setMontantPaiement(String(reste));
                setError(null);
                setPaiementModalOpen(true);
              }}
            >
              <CreditCard size={16} />
              Enregistrer un paiement
            </PrimaryButton>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <InlineBanner message={error} />
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-onyx-100 bg-white p-4 text-center">
          <p className="text-lg font-semibold text-onyx-900">
            {achat.montant_total.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-onyx-400">Total (FCFA)</p>
        </div>
        <div className="rounded-xl border border-onyx-100 bg-white p-4 text-center">
          <p className="text-lg font-semibold text-emerald-600">
            {achat.montant_paye.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-onyx-400">Payé</p>
        </div>
        <div className="rounded-xl border border-onyx-100 bg-white p-4 text-center">
          <p
            className={`text-lg font-semibold ${
              reste > 0 ? "text-red-500" : "text-onyx-400"
            }`}
          >
            {reste.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-onyx-400">Reste (dette)</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-onyx-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-onyx-100 bg-onyx-50/50 text-left text-xs font-medium uppercase tracking-wide text-onyx-400">
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3 text-right">Qté</th>
              <th className="px-4 py-3 text-right">Prix unit.</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Réception</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-b border-onyx-50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-onyx-800">
                  {l.articles?.designation}
                </td>
                <td className="px-4 py-2.5 text-right text-onyx-500">
                  {l.quantite}
                </td>
                <td className="px-4 py-2.5 text-right text-onyx-500">
                  {l.prix_achat_unitaire.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-onyx-700">
                  {l.montant_ligne.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-2.5 text-onyx-500">
                  {l.emplacements?.nom}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      l.recu
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-onyx-100 text-onyx-500"
                    }`}
                  >
                    {l.recu ? "Reçu" : "En attente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lignes.some((l) => !l.recu) && achat.statut !== "Brouillon" && (
        <p className="mt-2 text-xs text-onyx-400">
          Les lignes non reçues se réceptionnent depuis{" "}
          <span className="font-medium">Achats &gt; Réceptions</span>.
        </p>
      )}

      <div className="mt-5">
        <h2 className="text-sm font-semibold text-onyx-800">Paiements</h2>
        {paiements.length === 0 ? (
          <p className="mt-2 text-sm text-onyx-400">
            Aucun paiement enregistré.
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {paiements.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-onyx-100 bg-white px-4 py-2.5 text-sm"
              >
                <span className="text-onyx-600">
                  {new Date(p.date_paiement).toLocaleDateString("fr-FR")} ·{" "}
                  {p.mode_paiement}
                </span>
                <span className="font-medium text-onyx-800">
                  {p.montant.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {paiementModalOpen && (
        <Modal
          title="Enregistrer un paiement"
          onClose={() => setPaiementModalOpen(false)}
        >
          <form onSubmit={handleAjouterPaiement} className="space-y-4">
            {error && <InlineBanner message={error} />}
            <p className="text-sm text-onyx-500">
              Reste à payer :{" "}
              <span className="font-medium text-onyx-800">
                {reste.toLocaleString("fr-FR")} FCFA
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
                value={montantPaiement}
                onChange={(e) => setMontantPaiement(e.target.value)}
                className="w-full rounded-lg border border-onyx-200 px-3.5 py-2.5 text-[15px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>
            <SelectField
              id="mode-paiement"
              label="Mode de paiement"
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
            >
              <option value="Espèces">Espèces</option>
              <option value="Banque">Banque</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Autre">Autre</option>
            </SelectField>
            <div className="flex gap-3 pt-2">
              <SecondaryButton
                type="button"
                onClick={() => setPaiementModalOpen(false)}
                className="flex-1"
              >
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit" loading={busy} className="flex-1">
                Enregistrer
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {annulationModalOpen && (
        <SecondPasswordModal
          title="Annuler l'achat"
          message={`Cette action retirera du stock les quantités déjà reçues pour ${achat.reference} et ne peut pas être défaite. Les paiements déjà enregistrés (${achat.montant_paye.toLocaleString("fr-FR")} FCFA) ne seront pas remboursés automatiquement.`}
          onCancel={() => setAnnulationModalOpen(false)}
          onConfirm={annulerAchatAvecMotDePasse}
        />
      )}

      {impressionOpen && (
        <DocumentImprimable
          typeDocument="Bon d'achat"
          reference={achat.reference}
          date={achat.date_achat}
          tiersLabel="Fournisseur"
          tiersNom={achat.fournisseurs?.nom}
          lignes={lignes.map((l) => ({
            designation: l.articles?.designation ?? "",
            quantite: l.quantite,
            prixUnitaire: l.prix_achat_unitaire,
            montant: l.montant_ligne,
          }))}
          montantTotal={achat.montant_total}
          montantPaye={achat.montant_paye}
          onClose={() => setImpressionOpen(false)}
        />
      )}
    </div>
  );
}
