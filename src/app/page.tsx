"use client";

import { UiStore } from "@/store/useUiStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootPage() {
  const router = useRouter();
  const activeTab = UiStore(state => state.activeTab);
  const [ hasHydrated, setHasHydrated ] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      router.replace(`/${activeTab}`);
    }
  }, [ hasHydrated, activeTab ]);

  return null;
}
