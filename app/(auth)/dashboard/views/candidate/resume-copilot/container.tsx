import React from 'react';
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

interface ContainerProps {
  id: string;
  items: any[];
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ id, items, children }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="bg-gray-50 p-4 rounded-lg min-h-[200px] border border-gray-200">
        {children}
      </div>
    </SortableContext>
  );
};

export default Container;