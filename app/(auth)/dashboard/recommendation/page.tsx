"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useStore from "@/app/state/useStore";
import { deobfuscateUUID } from "@/lib/global/protect-uuid";

export default function RecommendationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setEmployerRightPanelView } = useStore();

  useEffect(() => {
    const obfuscatedId = searchParams.get("id");
    if (obfuscatedId) {
      deobfuscateUUID(obfuscatedId)
        .then((deobfuscatedUUID) => {
          setEmployerRightPanelView("aiRecommendations", {
            selectedRecommendationId: deobfuscatedUUID,
            selectedRecommendationStatus: "empty", // Set a default or fetch the actual status
          });
          router.push("/dashboard");
        })
        .catch((error) => {
          console.error("Error deobfuscating UUID:", error);
          router.push("/dashboard");
        });
    } else {
      router.push("/dashboard");
    }
  }, [searchParams, setEmployerRightPanelView, router]);

  return null; // This page doesn't render anything
}
