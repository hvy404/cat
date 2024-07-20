"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateFilename } from "./filename-validation";
import { Save, FileText, AlertCircle } from "lucide-react";

interface SaveResumeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  setFilename: (filename: string) => void;
  onSave: () => Promise<void>;
}

const SaveResumeDialog: React.FC<SaveResumeDialogProps> = ({
  isOpen,
  onOpenChange,
  filename,
  setFilename,
  onSave,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidation = useCallback(async (input: string) => {
    setIsValidating(true);
    const result = await validateFilename(input);
    setError(result.error);
    setIsValidating(false);
    return result.success;
  }, []);

  const handleSave = async () => {
    const isValid = await handleValidation(filename);
    if (!isValid) return;

    try {
      const isBlocked = await contentModerationWordFilter(filename);
      if (isBlocked) {
        setError("Please choose a different name.");
      } else {
        setError(null);
        await onSave();
      }
    } catch (err) {
      setError("An error occurred while saving the resume. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Save className="h-5 w-5 text-gray-700" />
            Save Resume Version
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Create a new version of your resume to tailor for specific job
            applications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="space-y-1">
            <label
              htmlFor="filename"
              className="text-xs font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Version Name
            </label>
            <Input
              id="filename"
              className="col-span-3"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter a memorable name for this version"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <h4 className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-1">
              <FileText className="h-3 w-3" />
              Naming Tip
            </h4>
            <p className="text-xs text-gray-600">
              Use descriptive names like "Software Engineer - Startup" or
              "Marketing Manager - Tech" to easily identify each version.
            </p>
          </div>
        </div>
        {error && (
          <Alert
            variant="destructive"
            className="mt-2 bg-red-50 text-red-900 border-red-200"
          >
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isValidating}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isValidating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                <span className="text-sm">Please wait...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                <span className="text-sm">Save Version</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveResumeDialog;
