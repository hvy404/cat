import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Item } from './types';
import { getFieldsForItemType, fieldLabels } from './item-fields';
import { personalLabelMap } from './personal-labels';

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

  const fields = getFieldsForItemType(editingItem.type, editingItem.content.key);

  const getFieldLabel = (field: string) => {
    if (editingItem.type === "personal") {
      return personalLabelMap[editingItem.content.key] || editingItem.content.key;
    }
    if (editingItem.type === "skills" && field === "value") {
      return "Skills";
    }
    return fieldLabels[field] || field;
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
              {field === "honors_awards_coursework" ||
              field === "responsibilities" ||
              editingItem.type === "skills" ? (
                <Textarea
                  id={field}
                  value={
                    editingItem.type === "skills"
                      ? editingItem.content.value
                      : editingItem.content[field] || ""
                  }
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content:
                        editingItem.type === "skills"
                          ? { ...editingItem.content, value: e.target.value }
                          : {
                              ...editingItem.content,
                              [field]: e.target.value,
                            },
                    })
                  }
                />
              ) : (
                <Input
                  type="text"
                  id={field}
                  value={
                    editingItem.type === "personal"
                      ? editingItem.content.value
                      : editingItem.content[field] || ""
                  }
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content:
                        editingItem.type === "personal"
                          ? { ...editingItem.content, value: e.target.value }
                          : {
                              ...editingItem.content,
                              [field]: e.target.value,
                            },
                    })
                  }
                />
              )}
            </div>
          ))}
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;