"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { LoadPreviousJDSessions } from "@/lib/jd-builder/fetcher/fetch-previous-sow";
import useStore from "@/app/state/useStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface PreviousSOWDropdownProps {
  sow_id: string;
  created_at: string;
  name: string;
}

export default function PreviousSOWDropdown() {
  // Get state from the store
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();

  const { user: clerkUser } = useUser();
  const userId = clerkUser?.publicMetadata?.aiq_cuid as string;

  // Store previous sessions state
  const [previousSessions, setPreviousSessions] = useState<
    PreviousSOWDropdownProps[]
  >([]);

  useEffect(() => {
    const handleGetPreviousSessions = async () => {
      try {
        if (userId) {
          const fetchedSessions = await LoadPreviousJDSessions(userId);
          const formattedSessions = fetchedSessions.map((session) => ({
            sow_id: session.sow_id,
            name: session.name || "Untitled",
            created_at: session.created_at,
          }));
  
          if (formattedSessions.length > 0) {
            setPreviousSessions(formattedSessions);
          }
        }
      } catch (error) {
        // Handle error if needed
      }
    };
  
    handleGetPreviousSessions();
  }, [userId]);
  
  // Handle dropdown selection
  const handleSelect = (sow_id: string) => {
    setJDBuilderWizard({ ...jdBuilderWizard, sowID: sow_id });
    updateJDBuilderWizardStep(3);
  };

  return (
    <div className="flex flex-col w-full justify-center items-center space-y-4">
      {previousSessions && previousSessions.length > 0 && (
        <>
          <div className="flex justify-center">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Previous Session" />
              </SelectTrigger>
              <SelectContent>
                {previousSessions.map((session, index) => (
                  <SelectItem key={index} value={session.sow_id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
