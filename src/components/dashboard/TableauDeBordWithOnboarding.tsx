"use client";

import { useState } from "react";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export function TableauDeBordWithOnboarding({
  presentationVueInitiale,
  children,
}: {
  presentationVueInitiale: boolean;
  children: React.ReactNode;
}) {
  const [vue, setVue] = useState(presentationVueInitiale);

  return (
    <>
      {children}
      {!vue && <OnboardingTour onDone={() => setVue(true)} />}
    </>
  );
}
