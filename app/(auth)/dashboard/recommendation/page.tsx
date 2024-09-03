"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useStore from "@/app/state/useStore";
import { deobfuscateUUID } from "@/lib/global/protect-uuid"

export default function RecommendationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setEmployerRightPanelView } = useStore();

  useEffect(() => {
    const recId = searchParams.get("id");
    if (recId) {
      setEmployerRightPanelView("aiRecommendations", {
        selectedRecommendationId: recId,
        selectedRecommendationStatus: "empty", // Set a default or fetch the actual status
      });
      router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }
  }, [searchParams, setEmployerRightPanelView, router]);

  return null; // This page doesn't render anything
}
