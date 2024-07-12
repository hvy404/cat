import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className="bg-white shadow-sm rounded-md p-3 mb-2 border border-gray-100 hover:border-gray-300 transition-colors duration-200"
    >
      <div className="flex items-start">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <GripVertical size={20} />
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default SortableItem;