import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Item } from "./types";
import { getFieldsForItemType, fieldLabels } from "./item-fields";
import { personalLabelMap } from "./personal-labels";
import { MonthYearPicker } from "@/app/(auth)/dashboard/views/candidate/assets/date-picker-my";

interface EditDialogProps {
  editingItem: Item | null;
  setEditingItem: (item: Item | null) => void;
  handleSaveEdit: (item: Item) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({
  editingItem,
  setEditingItem,
  handleSaveEdit,
}) => {
  if (!editingItem) return null;

  const fields = getFieldsForItemType(editingItem.type);

  const getFieldLabel = (field: string) => {
    if (editingItem.type === "personal") {
      return editingItem.content.key;
    }
    return fieldLabels[field] || field;
  };

  const handleDateChange = (field: string) => (value: string | undefined) => {
    setEditingItem({
      ...editingItem,
      content: {
        ...editingItem.content,
        [field]: value,
      },
    });
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditingItem({
      ...editingItem,
      content:
        editingItem.type === "personal" || editingItem.type === "skills"
          ? { ...editingItem.content, value: e.target.value }
          : { ...editingItem.content, [field]: e.target.value },
    });
  };

  const renderField = (field: string) => {
    const value =
      editingItem.type === "personal" || editingItem.type === "skills"
        ? editingItem.content.value
        : editingItem.content[field] || "";

    if (
      field === "start_date" ||
      field === "end_date" ||
      field === "date_obtained" ||
      field === "expiration_date" ||
      field === "publication_date"
    ) {
      return (
        <MonthYearPicker
          value={value}
          onChange={handleDateChange(field)}
          allowPresent={field === "end_date" || field === "expiration_date"}
        />
      );
    }

    if (
      field === "honors_awards_coursework" ||
      field === "responsibilities" ||
      field === "description" ||
      editingItem.type === "skills"
    ) {
      return (
        <Textarea
          id={field}
          value={value}
          onChange={handleInputChange(field)}
        />
      );
    }

    return (
      <Input
        type={field === "credential_url" ? "url" : "text"}
        id={field}
        value={value}
        onChange={handleInputChange(field)}
      />
    );
  };

  return (
    <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {editingItem.type}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit(editingItem);
          }}
        >
          {fields.map((field) => (
            <div key={field} className="mb-4">
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700"
              >
                {getFieldLabel(field)}
              </label>
              {renderField(field)}
            </div>
          ))}
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;