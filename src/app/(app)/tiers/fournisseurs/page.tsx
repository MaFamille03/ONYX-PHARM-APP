import { TiersManager } from "@/components/tiers/TiersManager";

export default function FournisseursPage() {
  return (
    <TiersManager
      table="fournisseurs"
      titreSingulier="Fournisseur"
      titrePluriel="Fournisseurs"
      description="Fiches fournisseurs : coordonnées, statut et observations."
    />
  );
}
