import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newSectionTitle: string;
  setNewSectionTitle: (title: string) => void;
  handleAddCustomSection: () => void;
}

const AddSectionDialog: React.FC<AddSectionDialogProps> = ({
  isOpen,
  onOpenChange,
  newSectionTitle,
  setNewSectionTitle,
  handleAddCustomSection,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Section</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCustomSection();
          }}
        >
          <Input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Enter section title"
            className="mb-4"
          />
          <Button type="submit">Add Section</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectionDialog;