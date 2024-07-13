import React, { useEffect, useState } from "react";
import useStore from "@/app/state/useStore";
import { getCompleteTalentProfile, TalentProfile } from "./get-data";
import ResumeBuilder from "./builder";
import { Item } from "./types";

export default function CandidateResumeCopilot() {
  const { user } = useStore();
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchTalentProfile = async () => {
      if (user && user.uuid) {
        setIsLoading(true);
        setError(null);
        try {
          const profile = await getCompleteTalentProfile(user.uuid);
          console.log("Talent Profile:", profile);
          setTalentProfile(profile);
        } catch (err) {
          setError("Failed to fetch talent profile");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTalentProfile();
  }, [user]);

  const handleSelectedItemsChange = (items: Item[]) => {
    setSelectedItems(items);
  };

  return (
    <main className="flex flex-1 p-4 max-h-screen overflow-hidden">
      <div className="w-full">
        <div className="flex justify-between items-center gap-6 rounded-lg border p-4 bg-white shadow-sm mb-4">
          <h2 className="text-xl font-bold text-gray-900">Resume Coach</h2>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {isLoading && <p className="text-gray-600">Loading talent profile...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {talentProfile && (
            <ResumeBuilder
              talentProfile={talentProfile}
              onSelectedItemsChange={handleSelectedItemsChange}
              selectedItems={selectedItems}
            />
          )}
        </div>
      </div>
    </main>
  );
}