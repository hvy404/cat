import React from 'react';
import { Item } from './types';
import Container from './container';
import SortableItem from './sortable';

interface AvailableItemsProps {
  items: Item[];
  renderCondensedItemContent: (item: Item) => React.ReactNode;
}

export const AvailableItems: React.FC<AvailableItemsProps> = ({
  items,
  renderCondensedItemContent,
}) => {
  return (
    <div className="w-1/3 flex flex-col">
      <h2 className="text-md font-semibold text-gray-800 mb-4">
        Available Items
      </h2>
      <div className="flex-1 overflow-y-auto pr-4">
        <Container id="available" items={items}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {renderCondensedItemContent(item)}
            </SortableItem>
          ))}
        </Container>
      </div>
    </div>
  );
};