"use client";

import { useState } from "react";
import { MapPin, Tag, ListChecks } from "lucide-react";
import { EmplacementsSection } from "@/components/parametres/EmplacementsSection";
import { CategoriesSection } from "@/components/parametres/CategoriesSection";
import { OptionsSection } from "@/components/parametres/OptionsSection";

const TABS = [
  { id: "emplacements", label: "Emplacements", icon: MapPin },
  { id: "categories", label: "Catégories", icon: Tag },
  { id: "listes", label: "Listes", icon: ListChecks },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ParametresPage() {
  const [tab, setTab] = useState<TabId>("emplacements");

  return (
    <div>
      <h1 className="text-xl font-semibold text-onyx-900 sm:text-2xl">
        Paramètres
      </h1>
      <p className="mt-1 text-sm text-onyx-500">
        Configurez les catégories, emplacements et listes utilisées dans
        toute l&apos;application.
      </p>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-lg bg-onyx-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-onyx-900 shadow-sm"
                : "text-onyx-500 hover:text-onyx-700"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "emplacements" && <EmplacementsSection />}
        {tab === "categories" && <CategoriesSection />}
        {tab === "listes" && <OptionsSection />}
      </div>
    </div>
  );
}
