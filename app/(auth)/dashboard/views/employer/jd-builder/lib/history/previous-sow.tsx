"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LoadPreviousJDSessions,
  renameSow,
  deleteSowMeta,
} from "@/lib/jd-builder/fetcher/fetch-previous-sow";
import useStore from "@/app/state/useStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, CheckCircle } from "lucide-react";
import * as z from "zod";

interface PreviousSOWCardProps {
  sow_id: string;
  created_at: string;
  name: string;
}

const nameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9\s-]+$/,
    "Only letters, numbers, spaces, and hyphens are allowed"
  )
  .min(1, "Name cannot be empty")
  .max(30, "Name cannot be longer than 30 characters");

const PreviousSOWCard: React.FC<
  PreviousSOWCardProps & {
    onSelect: (sow_id: string) => void;
    onDelete: (sow_id: string) => void;
    onRename: (sow_id: string, currentName: string) => void;
  }
> = ({ sow_id, created_at, name, onSelect, onDelete, onRename }) => {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800">
        <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRename(sow_id, name)}
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Created: {created_at}
        </p>
      </CardContent>
      <div className="flex flex-col sm:flex-row justify-between p-2 bg-gray-50 dark:bg-gray-800">
        <Button
          onClick={() => onSelect(sow_id)}
          className="flex-1 mb-2 sm:mb-0 sm:mr-2"
          variant="outline"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Select
        </Button>
        <Button
          onClick={() => onDelete(sow_id)}
          className="flex-1 sm:ml-2"
          variant="outline"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
};
export default function PreviousSOWCards() {
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();
  const { user: clerkUser } = useUser();
  const userId = clerkUser?.publicMetadata?.aiq_cuid as string;
  const [previousSessions, setPreviousSessions] = useState<
    PreviousSOWCardProps[]
  >([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSowId, setSelectedSowId] = useState("");
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const handleGetPreviousSessions = async () => {
      try {
        if (userId) {
          const fetchedSessions = await LoadPreviousJDSessions(userId);
          const formattedSessions = fetchedSessions.map((session) => ({
            sow_id: session.sow_id,
            name: session.name || "Untitled",
            created_at: new Date(session.created_at).toLocaleDateString(),
          }));

          if (formattedSessions.length > 0) {
            setPreviousSessions(formattedSessions);
          }
        }
      } catch (error) {
        console.error("Error fetching previous sessions:", error);
      }
    };

    handleGetPreviousSessions();
  }, [userId]);

  const handleSelect = (sow_id: string) => {
    setJDBuilderWizard({ ...jdBuilderWizard, sowID: sow_id });
    updateJDBuilderWizardStep(3);
  };

  const handleRenameClick = (sowId: string, currentName: string) => {
    setSelectedSowId(sowId);
    setNewName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    try {
      const validatedName = nameSchema.parse(newName);
      await renameSow(selectedSowId, validatedName);
      setPreviousSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.sow_id === selectedSowId
            ? { ...session, name: validatedName }
            : session
        )
      );
      setIsRenameDialogOpen(false);
      setNameError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setNameError(error.errors[0].message);
      } else {
        console.error("Error renaming SOW:", error);
      }
    }
  };

  const handleDelete = (sowId: string) => {
    setSelectedSowId(sowId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSowMeta(selectedSowId);
      setPreviousSessions((prevSessions) =>
        prevSessions.filter((session) => session.sow_id !== selectedSowId)
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting SOW:", error);
    }
  };

  // if fetchedSessions is empty, return early
  if (previousSessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-center space-x-4 space-y-4">
        <div className="flex-grow h-px bg-gray-200"></div>
        <span className="text-sm text-gray-400 px-2 uppercase tracking-wider">
          or
        </span>
        <div className="flex-grow h-px bg-gray-200"></div>
      </div>
      <div className="text-center">
        {" "}
        <p className="text-sm text-gray-500 mb-2">
          Select from your previous SOW files
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
        {previousSessions.map((session) => (
          <PreviousSOWCard
            key={session.sow_id}
            sow_id={session.sow_id}
            name={session.name}
            created_at={session.created_at}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onRename={handleRenameClick}
          />
        ))}
      </div>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Opportunity</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              try {
                nameSchema.parse(e.target.value);
                setNameError(null);
              } catch (error) {
                if (error instanceof z.ZodError) {
                  setNameError(error.errors[0].message);
                }
              }
            }}
            placeholder="Enter new name"
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          <DialogFooter>
            <Button onClick={handleRename} disabled={!!nameError}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm">Are you sure you want to delete this SOW?</p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
