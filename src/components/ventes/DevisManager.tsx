"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ArrowLeft, Trash2, FileOutput, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { InlineBanner, StatutBadge } from "@/components/ui/Badges";
import { ClientSelect } from "@/components/tiers/ClientSelect";
import { DocumentImprimable } from "@/components/documents/DocumentImprimable";

type DevisRow = {
  id: string;
  reference: string;
  date_devis: string;
  montant_total: number;
  statut: string;
  clients: { nom: string } | null;
};

type ArticleOption = { id: string; designation: string; prix_vente_conseille: number };

type LigneBrouillon = {
  article_id: string;
  quantite: string;
  prix_unitaire: string;
};

export function DevisManager() {
  const [vue, setVue] = useState<"liste" | "creation" | "detail">("liste");
  const [devisOuvertId, setDevisOuvertId] = useState<string | null>(null);

  if (vue === "creation") {
    return (
      <NouveauDevis
        onCancel={() => setVue("liste")}
        onCreated={(id) => {
          setDevisOuvertId(id);
          setVue("detail");
        }}
      />
    );
  }

  if (vue === "detail" && devisOuvertId) {
    return <DevisDetail devisId={devisOuvertId} onBack={() => setVue("liste")} />;
  }

  return (
    <ListeDevis
      onCreate={() => setVue("creation")}
      onOpen={(id) => {
        setDevisOuvertId(id);
        setVue("detail");
      }}
    />
  );
}

function ListeDevis({
  onCreate,
  onOpen,
}: {
  onCreate: () => void;
  onOpen: (id: string) => void;
}) {
  const supabase = createClient();
  const [devis, setDevis] = useState<DevisRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("devis")
      .select("id, reference, date_devis, montant_total, statut, clients(nom)")
      .order("created_at", { ascending: false });
    if (data) setDevis(data as unknown as DevisRow[]);
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
            Devis
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            Propositions commerciales, convertibles en vente.
          </p>
        </div>
        <PrimaryButton onClick={onCreate} className="shrink-0">
          <Plus size={17} />
          Nouveau devis
        </PrimaryButton>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="py-10 text-center text-sm text-onyx-400">
            Chargement...
          </p>
        ) : devis.length === 0 ? (
          <div className="rounded-xl border border-dashed border-onyx-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-onyx-600">
              Aucun devis pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {devis.map((d) => (
              <button
                key={d.id}
                onClick={() => onOpen(d.id)}
                className="flex w-full items-center justify-between rounded-xl border border-onyx-100 bg-white p-4 text-left hover:bg-onyx-50/50"
              >
                <div>
                  <p className="font-medium text-onyx-900">
                    {d.reference}
                    {d.clients?.nom ? ` — ${d.clients.nom}` : ""}
                  </p>
                  <p className="text-xs text-onyx-400">
                    {new Date(d.date_devis).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-onyx-800">
                    {d.montant_total.toLocaleString("fr-FR")} FCFA
                  </p>
                  <StatutBadge statut={d.statut} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NouveauDevis({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (id: string) => void;
}) {
  const supabase = createClient();
  const [clientId, setClientId] = useState("");
  const [dateDevis, setDateDevis] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [articlesOptions, setArticlesOptions] = useState<ArticleOption[]>([]);
  const [lignes, setLignes] = useState<LigneBrouillon[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, designation, prix_vente_conseille")
      .eq("statut", "Actif")
      .order("designation")
      .then(({ data }) => {
        if (data) setArticlesOptions(data as ArticleOption[]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ajouterLigne() {
    setLignes([...lignes, { article_id: "", quantite: "1", prix_unitaire: "" }]);
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
      prix_unitaire: article ? String(article.prix_vente_conseille) : "",
    });
  }

  const montantTotal = lignes.reduce(
    (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix_unitaire) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lignes.length === 0) {
      setError("Ajoutez au moins un article.");
      return;
    }
    for (const l of lignes) {
      if (!l.article_id || !l.quantite || Number(l.quantite) <= 0) {
        setError("Chaque ligne doit avoir un article et une quantité valide.");
        return;
      }
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: refData, error: refError } = await supabase.rpc(
      "generer_numero_document",
      { p_prefixe: "DEV" }
    );
    if (refError || !refData) {
      setError("Impossible de générer la référence.");
      setSaving(false);
      return;
    }

    const { data: devis, error: devisError } = await supabase
      .from("devis")
      .insert({
        reference: refData,
        client_id: clientId || null,
        date_devis: dateDevis,
        montant_total: montantTotal,
        statut: "Brouillon",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();

    if (devisError || !devis) {
      setError("Impossible de créer le devis.");
      setSaving(false);
      return;
    }

    const { error: lignesError } = await supabase.from("lignes_devis").insert(
      lignes.map((l) => ({
        devis_id: devis.id,
        article_id: l.article_id,
        quantite: Number(l.quantite),
        prix_unitaire: Number(l.prix_unitaire) || 0,
      }))
    );

    setSaving(false);
    if (lignesError) {
      setError("Le devis a été créé mais les lignes n'ont pas pu être enregistrées.");
      return;
    }

    onCreated(devis.id);
  }

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-onyx-500 hover:text-onyx-800"
      >
        <ArrowLeft size={16} />
        Retour aux devis
      </button>

      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Nouveau devis
      </h1>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {error && <InlineBanner message={error} />}

        <div className="grid grid-cols-1 gap-4 rounded-xl border border-onyx-100 bg-white p-4 sm:grid-cols-2">
          <ClientSelect value={clientId} onChange={setClientId} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-onyx-700">
              Date
            </label>
            <input
              type="date"
              required
              value={dateDevis}
              onChange={(e) => setDateDevis(e.target.value)}
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
            <div className="mt-3 space-y-2">
              {lignes.map((l, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-onyx-100 bg-onyx-50/40 p-3 sm:grid-cols-12 sm:items-end"
                >
                  <div className="sm:col-span-6">
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
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-onyx-500">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={l.prix_unitaire}
                      onChange={(e) =>
                        majLigne(i, { prix_unitaire: e.target.value })
                      }
                      className="w-full rounded-md border border-onyx-200 px-2.5 py-2 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                    />
                  </div>
                  <div className="flex justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => supprimerLigne(i)}
                      className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Supprimer"
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
            Créer le devis
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

function DevisDetail({
  devisId,
  onBack,
}: {
  devisId: string;
  onBack: () => void;
}) {
  const supabase = createClient();
  const [devis, setDevis] = useState<
    (DevisRow & { client_id: string | null }) | null
  >(null);
  const [lignes, setLignes] = useState<
    {
      id: string;
      article_id: string;
      quantite: number;
      prix_unitaire: number;
      montant_ligne: number;
      articles: { designation: string } | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impressionOpen, setImpressionOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [devisRes, lignesRes] = await Promise.all([
      supabase
        .from("devis")
        .select(
          "id, reference, date_devis, montant_total, statut, client_id, clients(nom)"
        )
        .eq("id", devisId)
        .single(),
      supabase
        .from("lignes_devis")
        .select("id, article_id, quantite, prix_unitaire, montant_ligne, articles(designation)")
        .eq("devis_id", devisId),
    ]);
    if (devisRes.data)
      setDevis(devisRes.data as unknown as DevisRow & { client_id: string | null });
    if (lignesRes.data) setLignes(lignesRes.data as unknown as typeof lignes);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devisId]);

  useEffect(() => {
    load();
  }, [load]);

  async function convertirEnVente() {
    if (!devis) return;
    setConverting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Récupère un emplacement actif par défaut et les prix d'achat/vente
    // conseillés actuels des articles pour créer les lignes de vente.
    const [{ data: emplacements }, { data: articles }] = await Promise.all([
      supabase.from("emplacements").select("id").eq("actif", true).limit(1),
      supabase
        .from("articles")
        .select("id, prix_achat, prix_vente_conseille")
        .in("id", lignes.map((l) => l.article_id)),
    ]);

    const emplacementParDefaut = emplacements?.[0]?.id;
    if (!emplacementParDefaut) {
      setError("Aucun emplacement actif disponible pour créer la vente.");
      setConverting(false);
      return;
    }
    const articlesMap = new Map((articles ?? []).map((a) => [a.id, a]));

    const { data: refData, error: refError } = await supabase.rpc(
      "generer_numero_document",
      { p_prefixe: "FAC" }
    );
    if (refError || !refData) {
      setError("Impossible de générer la référence de vente.");
      setConverting(false);
      return;
    }

    const { data: vente, error: venteError } = await supabase
      .from("ventes")
      .insert({
        reference: refData,
        client_id: devis.client_id,
        montant_total: devis.montant_total,
        statut: "Brouillon",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();

    if (venteError || !vente) {
      setError("Impossible de créer la vente à partir de ce devis.");
      setConverting(false);
      return;
    }

    await supabase.from("lignes_ventes").insert(
      lignes.map((l) => {
        const art = articlesMap.get(l.article_id);
        return {
          vente_id: vente.id,
          article_id: l.article_id,
          emplacement_id: emplacementParDefaut,
          quantite: l.quantite,
          prix_achat_reference: art?.prix_achat ?? 0,
          prix_vente_conseille_reference: art?.prix_vente_conseille ?? 0,
          prix_vente_reel: l.prix_unitaire,
          remise: 0,
        };
      })
    );

    await supabase.from("devis").update({ statut: "Validé" }).eq("id", devisId);

    setConverting(false);
    setError(
      "Vente créée en brouillon — retrouvez-la dans Ventes > Ventes pour choisir l'emplacement de sortie et la valider."
    );
  }

  if (loading || !devis) {
    return (
      <p className="py-10 text-center text-sm text-onyx-400">Chargement...</p>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-onyx-500 hover:text-onyx-800"
      >
        <ArrowLeft size={16} />
        Retour aux devis
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-onyx-900 sm:text-2xl">
            {devis.reference}
            <StatutBadge statut={devis.statut} />
          </h1>
          <p className="mt-1 text-sm text-onyx-500">
            {new Date(devis.date_devis).toLocaleDateString("fr-FR")}
          </p>
        </div>
        {devis.statut === "Brouillon" && (
          <PrimaryButton onClick={convertirEnVente} loading={converting}>
            <FileOutput size={16} />
            Convertir en vente
          </PrimaryButton>
        )}
      </div>

      <div className="mt-3">
        <SecondaryButton onClick={() => setImpressionOpen(true)}>
          <Printer size={16} />
          Imprimer
        </SecondaryButton>
      </div>

      {error && (
        <div className="mt-3">
          <InlineBanner
            type={error.startsWith("Vente créée") ? "success" : "error"}
            message={error}
          />
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-onyx-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-onyx-100 bg-onyx-50/50 text-left text-xs font-medium uppercase tracking-wide text-onyx-400">
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3 text-right">Qté</th>
              <th className="px-4 py-3 text-right">Prix unit.</th>
              <th className="px-4 py-3 text-right">Montant</th>
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
                  {l.prix_unitaire.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-onyx-700">
                  {l.montant_ligne.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {impressionOpen && (
        <DocumentImprimable
          typeDocument="Devis"
          reference={devis.reference}
          date={devis.date_devis}
          tiersLabel="Client"
          tiersNom={devis.clients?.nom}
          lignes={lignes.map((l) => ({
            designation: l.articles?.designation ?? "",
            quantite: l.quantite,
            prixUnitaire: l.prix_unitaire,
            montant: l.montant_ligne,
          }))}
          montantTotal={devis.montant_total}
          onClose={() => setImpressionOpen(false)}
        />
      )}
    </div>
  );
}
