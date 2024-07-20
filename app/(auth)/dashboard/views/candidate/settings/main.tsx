import React, { useState, useEffect } from 'react';
import useStore from "@/app/state/useStore";
import CandidateSettingOptions from "./options";
import SidePanel from "./side-panel";
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActiveInfoType = 'default' | 'resumes' | 'preferences';


export default function CandidateDashboardSettings() {
  const { isExpanded, setExpanded, user } = useStore();
  const [activeInfo, setActiveInfo] = useState<ActiveInfoType>('default');

  if (!user) {
    return null;
  }

  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-[90vh] overflow-y-auto w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Account Preferences
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          {user && <CandidateSettingOptions setActiveInfo={setActiveInfo} />}
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl overflow-auto">
          <SidePanel activeInfo={activeInfo} />
        </div>
      </div>
    </main>
  );
}