import React, { useState, useEffect, use } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TalentProfile } from "./get-data";
import Container from "./container";
import SortableItem from "./sortable";
import { Item, ItemType } from "./types";
import Alert from "./alert";
import { buildAndLogPrompt } from "./promptBuilder";
import { useDebounce } from "./useDebounce";
import { z } from "zod";

interface ResumeBuilderProps {
  talentProfile: TalentProfile;
  onSelectedItemsChange?: (items: Item[]) => void;
  selectedItems?: Item[];
}

interface HistoryEntry {
  action: "add" | "remove" | "reorder";
  itemId: string;
  timestamp: number;
}

interface AlertState {
  id: string;
  message: string;
  isMinimized: boolean;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  talentProfile,
  onSelectedItemsChange,
  selectedItems = [],
}) => {
  const [items, setItems] = useState<Record<string, Item[]>>({
    available: [],
    preview: selectedItems,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [recentlyAddedItem, setRecentlyAddedItem] = useState<string | null>(
    null
  );
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Presets
  const moveItemsToPreview = (itemKeys: string[]) => {
    setItems((prevItems) => {
      const newAvailable = [...prevItems.available];
      const newPreview = [...prevItems.preview];

      itemKeys.forEach((key) => {
        const index = newAvailable.findIndex(
          (item) => item.type === "personal" && item.content.key === key
        );
        if (index !== -1) {
          const [item] = newAvailable.splice(index, 1);
          newPreview.push(item);
        }
      });

      return {
        available: newAvailable,
        preview: newPreview,
      };
    });
  };

  useEffect(() => {
    if (talentProfile) {
      const generateId = (type: string, index: number) => `${type}-${index}`;

      const availableItems: Item[] = [
        // Personal items
        ...Object.entries(talentProfile.talent ?? {}).map(
          ([key, value], index) => ({
            id: generateId("personal", index),
            type: "personal" as ItemType,
            content: { key, value: value ?? "" },
          })
        ),
        // Work experiences
        ...talentProfile.workExperiences.map((exp, index) => ({
          id: generateId("experience", index),
          type: "experience" as ItemType,
          content: exp,
        })),
        // Education
        ...talentProfile.education.map((edu, index) => ({
          id: generateId("education", index),
          type: "education" as ItemType,
          content: edu,
        })),
        // Skills - Create a separate item for each skill
        ...talentProfile.skills.map((skill, index) => ({
          id: generateId("skill", index),
          type: "skills" as ItemType,
          content: { key: "Skill", value: skill.name },
        })),
        // Certifications
        ...talentProfile.certifications.map((cert, index) => ({
          id: generateId("certification", index),
          type: "certifications" as ItemType,
          content: cert,
        })),
        // Projects
        ...talentProfile.projects.map((proj, index) => ({
          id: generateId("project", index),
          type: "projects" as ItemType,
          content: proj,
        })),
        // Publications
        ...talentProfile.publications.map((pub, index) => ({
          id: generateId("publication", index),
          type: "publications" as ItemType,
          content: pub,
        })),
      ];

      setItems((prev) => ({
        available: availableItems.filter(
          (item) => !selectedItems.some((selected) => selected.id === item.id)
        ),
        preview: selectedItems,
      }));
    }
  }, [talentProfile, selectedItems]);

  // Move items to preview when talentProfile is loaded
  useEffect(() => {
    if (talentProfile) {
      moveItemsToPreview(["name", "email", "city", "state", "zipcode"]);
    }
  }, []);

  const debouncedBuildAndLogPrompt = useDebounce(
    (items, history, talentProfile) => {
      buildAndLogPrompt(items, history, talentProfile);
    },
    3000 // 3 seconds delay
  );

  useEffect(() => {
    if (onSelectedItemsChange) {
      onSelectedItemsChange(items.preview);
    }

    // Call the debounced version of buildAndLogPrompt
    if (items.preview.length > 0 && history.length > 0) {
      debouncedBuildAndLogPrompt(items, history, talentProfile);
    }

    // Dismiss the alert when a new item is added
    if (
      recentlyAddedItem &&
      !items.preview.some((item) => item.id === recentlyAddedItem)
    ) {
      setRecentlyAddedItem(null);
    }
  }, [
    items.preview,
    onSelectedItemsChange,
    history,
    talentProfile,
    recentlyAddedItem,
  ]);

  const toggleAlertMinimize = (id: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, isMinimized: !alert.isMinimized } : alert
      )
    );
  };

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) =>
      items[key].some((item) => item.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const id = active.id as string;
    const overId = over?.id as string;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

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

      // Update history
      const action =
        activeContainer === "available" && overContainer === "preview"
          ? "add"
          : "remove";
      setHistory((prevHistory) => [
        ...prevHistory,
        { action, itemId: id, timestamp: Date.now() },
      ]);

      // Add or update alert when moving from available to preview
      if (activeContainer === "available" && overContainer === "preview") {
        setAlerts((prevAlerts) => {
          // Minimize all existing alerts
          const minimizedAlerts = prevAlerts.map((alert) => ({
            ...alert,
            isMinimized: true,
          }));

          const existingAlertIndex = minimizedAlerts.findIndex(
            (alert) => alert.id === id
          );
          if (existingAlertIndex !== -1) {
            // Update existing alert
            return minimizedAlerts.map((alert, index) =>
              index === existingAlertIndex
                ? {
                    ...alert,
                    message:
                      "Item added to resume, Item added to resume, Item added to resume, Item added to resume",
                    isMinimized: false,
                  }
                : alert
            );
          } else {
            // Add new alert
            return [
              ...minimizedAlerts,
              {
                id,
                message:
                  "Item added to resume, Item added to resume, Item added to resume, Item added to resume",
                isMinimized: false,
              },
            ];
          }
        });
      }

      return newItems;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const id = active.id as string;
    const overId = over?.id as string;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(
      (item) => item.id === id
    );
    const overIndex = items[overContainer].findIndex(
      (item) => item.id === overId
    );

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));

      // Update history for reordering
      setHistory((prevHistory) => [
        ...prevHistory,
        { action: "reorder", itemId: id, timestamp: Date.now() },
      ]);
    }

    setActiveId(null);
  };

  // Place this outside both functions
  const personalLabelMap: { [key: string]: string } = {
    Location: "Address",
    phone: "Phone Number",
    clearance_level: "Security Clearance",
    title: "Job Title",
    email: "Email Address",
    name: "Full Name",
    zipcode: "Zip Code",
    city: "City",
    state: "State",
  };

  const renderCondensedItemContent = (item: Item) => {
    const renderLabel = (label: string) => (
      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mr-2 mb-2 select-none">
        {label}
      </span>
    );

    switch (item.type) {
      case "personal":
        if (item.content.key === "Location") {
          const { city, state, zipcode } = item.content.value as {
            city: string | null;
            state: string | null;
            zipcode: string | null;
          };
          const locationParts = [city, state, zipcode].filter(Boolean);
          const locationString = locationParts.join(", ");
          return (
            <div className="space-y-1 select-none">
              {renderLabel("Personal")}
              <h3 className="text-md font-semibold text-gray-800">Address</h3>
              <p className="text-sm text-gray-600">
                {locationString || "Not specified"}
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Personal")}
            <h3 className="text-md font-semibold text-gray-800">
              {personalLabelMap[item.content.key] || item.content.key}
            </h3>
            <p className="text-sm text-gray-600">
              {item.content.value || "Not specified"}
            </p>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Experience")}
            <h4 className="text-md font-semibold text-gray-800">
              {item.content.job_title}
            </h4>
            <p className="text-sm text-gray-600">{item.content.organization}</p>
          </div>
        );
      case "education":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Education")}
            <h4 className="text-md font-semibold text-gray-800">
              {item.content.degree}
            </h4>
            <p className="text-sm text-gray-600">{item.content.institution}</p>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Skill")}
            <h4 className="text-sm text-gray-800">{item.content.value}</h4>
          </div>
        );
      case "certifications":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Certification")}
            <h4 className="text-sm text-gray-800">{item.content.name}</h4>
            <p className="text-sm text-gray-600">
              {item.content.issuing_organization}
            </p>
          </div>
        );
      case "projects":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Project")}
            <h4 className="text-md font-semibold text-gray-800">
              {item.content.title}
            </h4>
          </div>
        );
      case "publications":
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Publication")}
            <h4 className="text-md font-semibold text-gray-800">
              {item.content.title}
            </h4>
          </div>
        );
      default:
        return null;
    }
  };

  const renderItemContent = (item: Item) => {
    const content = (() => {
      switch (item.type) {
        case "personal":
          if (item.content.key === "Location") {
            const { city, state, zipcode } = item.content.value as {
              city: string | null;
              state: string | null;
              zipcode: string | null;
            };
            const locationParts = [city, state, zipcode].filter(Boolean);
            const locationString = locationParts.join(", ");
            return (
              <div className="space-y-1 select-none">
                <h3 className="text-md font-semibold text-gray-800">Address</h3>
                <p className="text-sm text-gray-600">
                  {locationString || "Not specified"}
                </p>
              </div>
            );
          }
          return (
            <div className="space-y-1 select-none">
              <h3 className="text-md font-semibold text-gray-800">
                {personalLabelMap[item.content.key] || item.content.key}
              </h3>
              <p className="text-sm text-gray-600">
                {item.content.value || "Not specified"}
              </p>
            </div>
          );
        case "experience":
          return (
            <div className="space-y-1 mb-4 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {item.content.job_title}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {item.content.organization}
              </p>
              <p className="text-sm text-gray-600">{`${item.content.start_date} - ${item.content.end_date}`}</p>
              <p className="text-sm text-gray-700 mt-2">
                {item.content.responsibilities}
              </p>
            </div>
          );
        case "education":
          return (
            <div className="space-y-1 mb-4 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {item.content.degree}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {item.content.institution}
              </p>
              <p className="text-sm text-gray-600">{`${item.content.start_date} - ${item.content.end_date}`}</p>
            </div>
          );
        case "skills":
          return (
            <div className="space-y-1 select-none">
              <h3 className="text-md font-semibold text-gray-800">Skill</h3>
              <p className="text-sm text-gray-600">{item.content.value}</p>
            </div>
          );
        case "certifications":
          return (
            <div className="space-y-1 mb-2 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {item.content.name}
              </h4>
              <p className="text-sm text-gray-700">
                {item.content.issuing_organization}
              </p>
              <p className="text-sm text-gray-600">{`Obtained: ${item.content.date_obtained}`}</p>
            </div>
          );
        case "projects":
          return (
            <div className="space-y-1 mb-4 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {item.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {item.content.description}
              </p>
            </div>
          );
        case "publications":
          return (
            <div className="space-y-1 mb-4 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {item.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {item.content.journal_or_conference}
              </p>
              <p className="text-sm text-gray-600">{`Published: ${item.content.publication_date}`}</p>
            </div>
          );
        default:
          return null;
      }
    })();

    const itemAlert = alerts.find((alert) => alert.id === item.id);

    return (
      <div>
        {content}
        {itemAlert && (
          <Alert
            message={itemAlert.message}
            isMinimized={itemAlert.isMinimized}
            onToggleMinimize={() => toggleAlertMinimize(item.id)}
          />
        )}
      </div>
    );
  };

  const renderPreview = () => {
    const groupedItems = items.preview.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<ItemType, Item[]>);

    const sectionOrder: ItemType[] = [
      "personal",
      "experience",
      "education",
      "skills",
      "certifications",
      "projects",
      "publications",
    ];

    return (
      <div className="bg-white shadow-lg rounded-lg p-8 space-y-6 w-full">
        {sectionOrder.map((sectionType) => {
          if (
            !groupedItems[sectionType] ||
            groupedItems[sectionType].length === 0
          ) {
            return null;
          }

          return (
            <div
              key={sectionType}
              className="pb-4 border-b border-gray-200 last:border-b-0"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                {sectionType}
              </h2>
              {sectionType === "personal" ? (
                <div className="grid grid-cols-2 gap-4">
                  {groupedItems[sectionType].map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      {renderItemContent(item)}
                    </SortableItem>
                  ))}
                </div>
              ) : (
                groupedItems[sectionType].map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    {renderItemContent(item)}
                  </SortableItem>
                ))
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-[calc(100vh-12rem)] overflow-hidden">
        <div className="w-1/3 flex flex-col">
          <h2 className="text-md font-semibold text-gray-800 mb-4">
            Available Items
          </h2>
          <div className="flex-1 overflow-y-auto pr-4">
            <Container id="available" items={items.available}>
              {items.available.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  {renderCondensedItemContent(item)}
                </SortableItem>
              ))}
            </Container>
          </div>
        </div>
        <div className="w-2/3 flex flex-col">
          <h2 className="text-md font-semibold text-gray-800 mb-4">
            Resume Preview
          </h2>
          <div className="flex-1 overflow-y-auto pr-4">
            <Container id="preview" items={items.preview}>
              {renderPreview()}
            </Container>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded-lg p-4">
            {renderItemContent(
              items[findContainer(activeId)!].find(
                (item) => item.id === activeId
              )!
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ResumeBuilder;
