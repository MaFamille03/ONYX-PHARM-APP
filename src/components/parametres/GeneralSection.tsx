"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { RevoirPresentationButton } from "@/components/onboarding/OnboardingTour";

type EntrepriseInfo = {
  nom: string;
  activite: string;
  telephone: string;
  email: string;
  logo_url: string;
};

export function GeneralSection() {
  const supabase = createClient();
  const [info, setInfo] = useState<EntrepriseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("parametres_generaux")
      .select("valeur")
      .eq("cle", "entreprise_info")
      .maybeSingle();
    if (data?.valeur) setInfo(data.valeur as unknown as EntrepriseInfo);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-onyx-400">Chargement...</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-onyx-100 bg-white p-4">
        <h3 className="text-sm font-semibold text-onyx-800">Entreprise</h3>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-onyx-100 bg-white p-2">
            <Image
              src={info?.logo_url || "/onyx-pharm-icon.png"}
              alt="Logo ONYX PHARM"
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-onyx-800">{info?.nom}</p>
            <p className="text-onyx-500">{info?.activite}</p>
            <p className="text-onyx-500">{info?.telephone}</p>
            <p className="text-onyx-500">{info?.email}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-onyx-400">
          Informations reprises du catalogue officiel ONYX PHARM. Pour toute
          mise à jour (logo, coordonnées), transmettez les nouveaux éléments
          pour intégration.
        </p>
      </div>

      <div className="rounded-xl border border-onyx-100 bg-white p-4">
        <h3 className="text-sm font-semibold text-onyx-800">
          Présentation de l&apos;application
        </h3>
        <p className="mt-1 text-xs text-onyx-400">
          Revoyez à tout moment la présentation des modules affichée aux
          nouveaux utilisateurs.
        </p>
        <div className="mt-3">
          <RevoirPresentationButton />
        </div>
      </div>
    </div>
  );
}
