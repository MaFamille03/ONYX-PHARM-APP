export type NavItem = {
  label: string;
  href: string;
  /** Étape (du plan de développement) à laquelle la page devient fonctionnelle */
  step: number;
};

export type NavSection = {
  label: string;
  /** Certaines entrées (Tableau de bord, Rapports...) n'ont pas de sous-menu */
  href?: string;
  step?: number;
  icon: string;
  children?: NavItem[];
};

// Reprend exactement la structure définie en section 5 du cahier des charges.
export const NAVIGATION: NavSection[] = [
  {
    label: "Tableau de bord",
    href: "/tableau-de-bord",
    step: 10,
    icon: "layout-dashboard",
  },
  {
    label: "Stock",
    icon: "package",
    children: [
      { label: "Articles", href: "/stock/articles", step: 4 },
      { label: "Stocks", href: "/stock/stocks", step: 4 },
      { label: "Mouvements", href: "/stock/mouvements", step: 5 },
      { label: "Transferts", href: "/stock/transferts", step: 5 },
      { label: "Inventaires", href: "/stock/inventaires", step: 5 },
      { label: "Alertes", href: "/stock/alertes", step: 4 },
      { label: "Conteneurs", href: "/stock/conteneurs", step: 10 },
    ],
  },
  {
    label: "Ventes",
    icon: "shopping-cart",
    children: [
      { label: "Devis", href: "/ventes/devis", step: 7 },
      { label: "Ventes", href: "/ventes/ventes", step: 7 },
      { label: "Paiements", href: "/ventes/paiements", step: 7 },
      { label: "Retours", href: "/ventes/retours", step: 7 },
    ],
  },
  {
    label: "Caisse",
    icon: "wallet",
    children: [
      { label: "Encaissements", href: "/caisse/encaissements", step: 8 },
      { label: "Décaissements", href: "/caisse/decaissements", step: 8 },
      { label: "Solde", href: "/caisse/solde", step: 8 },
    ],
  },
  {
    label: "Tiers",
    icon: "users",
    children: [
      { label: "Clients", href: "/tiers/clients", step: 3 },
      { label: "Fournisseurs", href: "/tiers/fournisseurs", step: 3 },
      { label: "Créances", href: "/tiers/creances", step: 7 },
      { label: "Dettes", href: "/tiers/dettes", step: 6 },
    ],
  },
  {
    label: "Rapports",
    href: "/rapports",
    step: 10,
    icon: "bar-chart-3",
  },
  {
    label: "Import / Export",
    href: "/import-export",
    step: 10,
    icon: "file-spreadsheet",
  },
  {
    label: "Utilisateurs",
    href: "/utilisateurs",
    step: 1,
    icon: "user-cog",
  },
  {
    label: "Historique",
    href: "/historique",
    step: 9,
    icon: "history",
  },
  {
    label: "Paramètres",
    href: "/parametres",
    step: 3,
    icon: "settings",
  },
];
