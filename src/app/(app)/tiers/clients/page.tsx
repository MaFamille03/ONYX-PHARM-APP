import { TiersManager } from "@/components/tiers/TiersManager";

export default function ClientsPage() {
  return (
    <TiersManager
      table="clients"
      titreSingulier="Client"
      titrePluriel="Clients"
      description="Fiches clients : coordonnées, statut et observations."
    />
  );
}
