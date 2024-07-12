import React, { useEffect, useState } from "react";
import useStore from "@/app/state/useStore";
import { getCompleteTalentProfile, TalentProfile } from "./get-data";
import ResumeBuilder from "./builder";

interface Item {
  id: string;
  type: string;
  content: any;
}

export default function CandidateResumeCopilot() {
  const { isExpanded, setExpanded, toggleExpansion, user } = useStore();
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

  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  const handleSelectedItemsChange = (items: Item[]) => {
    setSelectedItems(items);
  };

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between items-center gap-6 rounded-lg border p-4 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Resume Builder</h2>
          <button onClick={toggleExpansion} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
        <div className="flex flex-col gap-6 overflow-auto bg-white rounded-lg p-6 shadow-sm">
          {isLoading && <p className="text-gray-600">Loading talent profile...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {talentProfile && (
            <ResumeBuilder
              talentProfile={talentProfile}
              onSelectedItemsChange={handleSelectedItemsChange}
            />
          )}
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          <div className="grid gap-6">
            <h3 className="text-lg font-semibold">Resume Preview</h3>
            {talentProfile && (
              <ResumeBuilder
                talentProfile={talentProfile}
                previewMode={true}
                onSelectedItemsChange={handleSelectedItemsChange}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}