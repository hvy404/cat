import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Item, CustomSection, QueueItem, HistoryItems } from "./types";

export const handleDragEnd = (
  event: DragEndEvent,
  items: Record<string, Item[]>,
  customSections: CustomSection[],
  findContainer: (id: string) => string | undefined,
  setItems: React.Dispatch<React.SetStateAction<Record<string, Item[]>>>,
  setCustomSections: React.Dispatch<React.SetStateAction<CustomSection[]>>,
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>,
  setDraggedItem: React.Dispatch<React.SetStateAction<Item | null>>,
  dragStartContainer: string | null,
  excludedPersonalItems: string[],
  setLastModifiedItemId: React.Dispatch<React.SetStateAction<string | null>>,
  setActionHistory: React.Dispatch<React.SetStateAction<HistoryItems[]>>,
  setProcessingQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>,
  setProcessingItems: React.Dispatch<React.SetStateAction<Set<string>>>,
  handleAddCustomItem: (sectionId: string) => void,
  handleCraniumItems: () => Promise<void>,
  handleCraniumHistory: () => Promise<void>
) => {
  const { active, over } = event;
  const id = active.id as string;
  const overId = over?.id as string;

  if (id === "custom-card" && overId) {
    const targetSection = customSections.find((section) =>
      section.items.some((item) => item.id === overId)
    );
    if (targetSection) {
      handleAddCustomItem(targetSection.id);
    } else {
      const newSectionId = `custom-section-${Date.now()}`;
      const newSection: CustomSection = {
        id: newSectionId,
        title: "New Custom Section",
        items: [],
      };
      setCustomSections([...customSections, newSection]);
      handleAddCustomItem(newSectionId);
    }
    return;
  }

  const sourceSection = customSections.find((section) =>
    section.items.some((item) => item.id === id)
  );
  const targetSection = customSections.find((section) =>
    section.items.some((item) => item.id === overId)
  );

  if (sourceSection && targetSection) {
    setCustomSections((prevSections) =>
      prevSections.map((section) => {
        if (
          section.id === sourceSection.id &&
          section.id === targetSection.id
        ) {
          const oldIndex = section.items.findIndex((item) => item.id === id);
          const newIndex = section.items.findIndex(
            (item) => item.id === overId
          );
          const newItems = arrayMove(section.items, oldIndex, newIndex);
          return { ...section, items: newItems };
        } else if (section.id === sourceSection.id) {
          return {
            ...section,
            items: section.items.filter((item) => item.id !== id),
          };
        } else if (section.id === targetSection.id) {
          const itemToMove = sourceSection.items.find(
            (item) => item.id === id
          )!;
          const overIndex = section.items.findIndex(
            (item) => item.id === overId
          );
          const newItems = [...section.items];
          newItems.splice(overIndex, 0, itemToMove);
          return { ...section, items: newItems };
        }
        return section;
      })
    );
    return;
  }

  const activeContainer = findContainer(id);
  const overContainer = findContainer(overId);

  setItems((prevItems) => {
    const activeItems = prevItems[activeContainer as keyof typeof prevItems];
    const overItems = prevItems[overContainer as keyof typeof prevItems];

    if (!activeItems || !overItems) {
      console.error("Invalid containers:", {
        activeContainer,
        overContainer,
        prevItems,
      });
      return prevItems;
    }

    const activeIndex = activeItems.findIndex((item) => item.id === id);
    const overIndex = overItems.findIndex((item) => item.id === overId);

    let newItems = { ...prevItems };

    if (activeContainer !== overContainer) {
      newItems = {
        ...newItems,
        [activeContainer as keyof typeof prevItems]: activeItems.filter(
          (item) => item.id !== id
        ),
        [overContainer as keyof typeof prevItems]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex),
        ],
      };
    } else {
      newItems = {
        ...newItems,
        [overContainer as keyof typeof prevItems]: arrayMove(
          overItems,
          activeIndex,
          overIndex
        ),
      };
    }

    if (
      ((activeItems[activeIndex].type === "experience" ||
        activeItems[activeIndex].type === "education") &&
        overContainer === "chosen") ||
      (overContainer === "chosen" &&
        newItems["chosen"].some(
          (item) => item.type === "experience" || item.type === "education"
        ))
    ) {
      const allItems = newItems["chosen"];
      const experienceAndEducationItems = allItems.filter(
        (item) => item.type === "experience" || item.type === "education"
      );
      const otherItems = allItems.filter(
        (item) => item.type !== "experience" && item.type !== "education"
      );

      const sortedExperienceAndEducationItems =
        experienceAndEducationItems.sort((a, b) => {
          if (
            (a.type !== "experience" && a.type !== "education") ||
            (b.type !== "experience" && b.type !== "education")
          )
            return 0;

          const aEndDate = a.content.end_date.toLowerCase();
          const bEndDate = b.content.end_date.toLowerCase();

          if (aEndDate === "present" && bEndDate === "present") {
            return b.content.start_date.localeCompare(a.content.start_date);
          }

          if (aEndDate === "present") return -1;
          if (bEndDate === "present") return 1;

          const endDateComparison = bEndDate.localeCompare(aEndDate);
          if (endDateComparison !== 0) return endDateComparison;

          return b.content.start_date.localeCompare(a.content.start_date);
        });

      const sortedExperienceItems = sortedExperienceAndEducationItems.filter(
        (item) => item.type === "experience"
      );
      const sortedEducationItems = sortedExperienceAndEducationItems.filter(
        (item) => item.type === "education"
      );

      newItems["chosen"] = [
        ...sortedExperienceItems,
        ...sortedEducationItems,
        ...otherItems,
      ];
    }

    const movedItem = activeItems[activeIndex];
    const isExcludedPersonalItem =
      movedItem.type === "personal" &&
      excludedPersonalItems.includes(movedItem.content.key);

    if (!isExcludedPersonalItem) {
      if (dragStartContainer === "available" && overContainer === "chosen") {
        setLastModifiedItemId(id);

        const newAction = {
          action: "add",
          itemId: id,
          itemType: movedItem.type,
          fromContainer: dragStartContainer,
          toContainer: overContainer,
          newIndex: overIndex,
        };

        setActionHistory((prevHistory) => [
          ...prevHistory,
          {
            ...newAction,
            action: newAction.action as "add" | "remove",
            itemType: newAction.itemType as string,
            toContainer: newAction.toContainer as string | null,
          },
        ]);

        if (
          movedItem.type !== "personal" ||
          (movedItem.type === "personal" && movedItem.content.key === "intro")
        ) {
          setProcessingQueue((prevQueue) => [
            ...prevQueue,
            { itemId: id, cardContent: movedItem.content },
          ]);

          setProcessingItems((prev) => new Set(prev).add(id));
        }
      }
    }

    return newItems;
  });

  setActiveId(null);
  setDraggedItem(null);
  // Update choice memory bank
  handleCraniumItems();
   // Update Cranium History
   handleCraniumHistory();
};
