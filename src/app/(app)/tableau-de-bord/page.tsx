import { createClient } from "@/lib/supabase/server";
import {
  ShoppingCart,
  Package,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const CARDS = [
  {
    label: "Chiffre d'affaires",
    value: "—",
    hint: "Disponible à l'étape 7 (Ventes)",
    icon: ShoppingCart,
  },
  {
    label: "Valeur du stock",
    value: "—",
    hint: "Disponible à l'étape 4 (Articles & Stock)",
    icon: Package,
  },
  {
    label: "Solde de caisse",
    value: "—",
    hint: "Disponible à l'étape 8 (Caisse)",
    icon: Wallet,
  },
  {
    label: "Alertes actives",
    value: "—",
    hint: "Stock faible, expirations, créances",
    icon: AlertTriangle,
  },
];

export default async function TableauDeBordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const heureActuelle = new Date().getHours();
  const salutation =
    heureActuelle < 12
      ? "Bonjour"
      : heureActuelle < 18
        ? "Bon après-midi"
        : "Bonsoir";

  return (
    <div>
      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        {salutation}
        {user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm text-onyx-500">
        Vue d&apos;ensemble de l&apos;activité ONYX PHARM.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-onyx-100 bg-white p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-onyx-50 text-onyx-500">
              <card.icon size={18} />
            </div>
            <p className="mt-3 text-lg font-semibold text-onyx-900 sm:text-xl">
              {card.value}
            </p>
            <p className="text-xs font-medium text-onyx-500">{card.label}</p>
            <p className="mt-1 text-[11px] text-onyx-300">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-onyx-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-onyx-800">
          Socle technique — Étape 1
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-onyx-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
            Authentification sécurisée (connexion, inscription, mot de passe
            oublié, déconnexion) opérationnelle via Supabase Auth.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
            Navigation complète de l&apos;application en place (Stock, Ventes,
            Achats, Caisse, Tiers, Rapports, etc.), avec pages en
            construction pour les modules à venir.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
            Interface responsive testée mobile, tablette et ordinateur.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
            Prête à être déployée sur Vercel et connectée à Supabase.
          </li>
        </ul>
      </div>
    </div>
  );
}
