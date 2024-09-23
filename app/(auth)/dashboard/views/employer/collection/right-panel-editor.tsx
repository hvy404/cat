import { useState, useEffect } from "react";
import RichTextEditor from "@/app/(auth)/dashboard/views/employer/collection/editor/input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import zod from "zod";
import {
  fetchPresetEntry,
  savePresetEntry,
  createPresetEntry,
  deletePresetEntry,
} from "@/lib/collection/presetEntry";

enum PanelType {
  Intro = "intro",
  Benefits = "benefits",
}

interface PanelEditorProps {
  editingID?: string | null;
  setEditingID: (id: string | null) => void;
  userID: string | undefined;
  type?: PanelType;
  addNew?: boolean;
  onUpdate: () => Promise<void>;
}

const titleSchema = zod
  .string()
  .regex(
    /^[a-zA-Z0-9 ]*$/,
    "Title can only contain letters, numbers, and spaces"
  );

export default function CollectRightPanelEditor({
  editingID,
  setEditingID,
  userID,
  type,
  addNew,
  onUpdate,
}: PanelEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writerContent, setWriterContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const result = titleSchema.safeParse(value);

    if (result.success) {
      setTitle(value);
      setError(null);
    } else {
      setError(result.error.errors[0].message);
    }
  };

  useEffect(() => {
    if (addNew) {
      return;
    }
  
    const handleFetch = async (userID: string, editingID: string) => {
      if (!userID) {
        return;
      }
      const result = await fetchPresetEntry(userID, editingID);
      if (result.title) {
        setTitle(result.title);
      }
      if (result.content) {
        setContent(result.content);
      }
    };
  
    if (userID && editingID) {
      handleFetch(userID, editingID);
    }
  }, [userID, editingID, addNew]);
  

  // handle Cancel click, by clearing ediitingID
  const handleCancel = () => {
    setEditingID(null);
  };

  // handle Save click
  const handleSave = async () => {
    if (!userID || !editingID) {
      console.error("userID or editingID is null or undefined");
      return;
    }

    const fallbackTitle = title || "Untitled";
    const fallbackWriterContent = writerContent || "";

    const result = await savePresetEntry(
      userID,
      editingID,
      fallbackTitle,
      fallbackWriterContent
    );
    if (result.success) {
      setEditingID(null);
      onUpdate();
    } else {
      console.error("Failed to save entry");
    }
  };

  // Handle save click for new entry
  const handleCreate = async () => {
    if (!userID || !type) {
      console.error("userID is null or undefined");
      return;
    }

    // Provide fallback values
    const fallbackTitle = title || "Untitled";
    const fallbackWriterContent = writerContent || "";

    const result = await createPresetEntry(
      userID,
      fallbackTitle,
      fallbackWriterContent,
      type
    );
    if (result.success) {
      setEditingID(null);
      onUpdate();
    } else {
      console.error("");
    }
  };

  // Handle delete click
  const handleDelete = async () => {
    if (!userID || !editingID) {
      console.error("userID or editingID is null or undefined");
      return;
    }

    const result = await deletePresetEntry(userID, editingID);
    if (result.success) {
      setEditingID(null);
      onUpdate();
    } else {
      console.error("Failed to delete entry");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input
          type="text"
          id="title"
          placeholder="Title"
          className="bg-gray-50"
          value={title}
          onChange={handleTitleChange}
        />
        {error && <p className="text-red-900 text-sm">{error}</p>}
      </div>
      <div className="gap-0">
        <RichTextEditor value={content} onChange={setWriterContent} />
      </div>
      <div
        className={`flex gap-2 ${addNew ? "justify-end" : "justify-between"}`}
      >
        {!addNew && (
          <div>
            <Button
              onClick={handleDelete}
              variant={"link"}
              className="text-red-900"
            >
              Delete
            </Button>
          </div>
        )}

        <div>
          <Button
            onClick={handleCancel}
            variant={"ghost"}
            className="btn btn-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={addNew ? handleCreate : handleSave}
            variant={"outline"}
            className="btn btn-primary"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
