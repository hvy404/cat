"use client";
import { useState, useEffect } from "react";
import { LoadPreviousJDSessions } from "@/lib/jd-builder/fetcher/fetch-previous-sow";
import useStore from "@/app/state/useStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreviousSOWDropdownProps {
  sow_id: string; // Changed to match your updated property name
  created_at: string;
  name: string; // Ensuring name is part of the interface and no default value is set here
}

export default function PreviousSOWDropdown() {
  // Get state from the store
  const {
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
    user,
  } = useStore();

  const userId = user?.uuid ?? "";

  // Store previous sessions state
  const [previousSessions, setPreviousSessions] = useState<
    PreviousSOWDropdownProps[]
  >([]);

  useEffect(() => {
    handleGetPreviousSessions();
  }, [userId]);

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
      } else {
        //console.error("Employer ID is null");
      }
    } catch (error) {
      //console.error("Failed to load previous sessions", error);
    }
  };

  // Handle dropdown selection
  const handleSelect = (sow_id: string) => {
    setJDBuilderWizard({ ...jdBuilderWizard, sowID: sow_id });
    updateJDBuilderWizardStep(3);
  };

  return (
    <div className="flex flex-col w-full justify-center">
      {previousSessions && previousSessions.length > 0 && (
        <div className="flex justify-center">
          <Select
            onValueChange={handleSelect} // Added onValueChange to handle dropdown selection
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Previous Session" />
            </SelectTrigger>
            <SelectContent>
              {previousSessions.map((session, index) => (
                <SelectItem key={index} value={session.sow_id}>
                  {session.name}
                </SelectItem> // Using `name` for display and `sow_id` for value
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
