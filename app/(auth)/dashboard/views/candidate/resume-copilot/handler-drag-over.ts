import { DragOverEvent } from "@dnd-kit/core";
import { Item } from "./types";

export const handleDragOver = (
  event: DragOverEvent,
  findContainer: (id: string) => string | undefined,
  setItems: React.Dispatch<React.SetStateAction<Record<string, Item[]>>>
) => {
  const { active, over } = event;
  const id = active.id as string;
  const overId = over?.id as string;

  const activeContainer = findContainer(id);
  let overContainer = findContainer(overId);

  if (!overContainer) {
    if (over && over.id === "chosen") {
      overContainer = "chosen";
    } else {
      return;
    }
  }

  if (!activeContainer || activeContainer === overContainer) {
    return;
  }

  setItems((prev) => {
    const activeItems = prev[activeContainer];
    const overItems = prev[overContainer];

    if (!activeItems || !overItems) {
      console.error("Invalid containers:", {
        activeContainer,
        overContainer,
        prev,
      });
      return prev;
    }

    const activeIndex = activeItems.findIndex((item) => item.id === id);
    const overIndex = overItems.findIndex((item) => item.id === overId);

    let newIndex: number;
    if (overId in prev) {
      newIndex = overItems.length + 1;
    } else {
      const isBelowLastItem = over && overIndex === overItems.length - 1;
      newIndex = isBelowLastItem ? overIndex + 1 : overIndex;
    }

    const newItems = {
      ...prev,
      [activeContainer]: [
        ...prev[activeContainer].filter((item) => item.id !== active.id),
      ],
      [overContainer]: [
        ...prev[overContainer].slice(0, newIndex),
        activeItems[activeIndex],
        ...prev[overContainer].slice(newIndex, prev[overContainer].length),
      ],
    };

    return newItems;
  });
};