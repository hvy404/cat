"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useStore from "@/app/state/useStore";
import { deobfuscateUUID } from "@/lib/global/protect-uuid";

export default function InviteJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCandidateDashboard } = useStore();

  useEffect(() => {
    const obfuscatedId = searchParams.get("id");
    if (obfuscatedId) {
      deobfuscateUUID(obfuscatedId)
        .then((deobfuscatedUUID) => {
          setCandidateDashboard({
            widget: "inviteAlerts",
            widgetPayload: {
              type: "inviteAlerts",
              payload: { jobId: deobfuscatedUUID },
            },
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
  }, [searchParams, setCandidateDashboard, router]);

  return null; // This page doesn't render anything
}
