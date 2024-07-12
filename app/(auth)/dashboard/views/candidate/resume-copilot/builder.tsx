import React, { useState, useEffect } from "react";
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (talentProfile) {
      const { talent } = talentProfile as TalentProfile & {
        talent: {
          city: string | null;
          state: string | null;
          zipcode: string | null;
        };
      };

      // Group city, state, and zip code
      const locationItem: Item = {
        id: "personal-location",
        type: "personal",
        content: {
          key: "Location",
          value: {
            city: talent?.city ?? null,
            state: talent?.state ?? null,
            zipcode: talent?.zipcode ?? null,
          },
        },
      };

      const personalItems: Item[] = [
        locationItem,
        ...Object.entries(talent ?? {})
          .filter(([key, _]) => !["city", "state", "zipcode"].includes(key))
          .map(([key, value]) => ({
            id: `personal-${key}`,
            type: "personal" as ItemType,
            content: { key, value: value ?? "" },
          })),
      ];

      const availableItems: Item[] = [
        ...personalItems,
        ...talentProfile.workExperiences.map((exp, index) => ({
          id: `experience-${index}`,
          type: "experience" as ItemType,
          content: exp,
        })),
        ...talentProfile.education.map((edu, index) => ({
          id: `education-${index}`,
          type: "education" as ItemType,
          content: edu,
        })),
        {
          id: "skills",
          type: "skills",
          content: { key: "Skills", value: talentProfile.skills },
        },
        ...talentProfile.certifications.map((cert, index) => ({
          id: `certification-${index}`,
          type: "certifications" as ItemType,
          content: cert,
        })),
        ...talentProfile.projects.map((proj, index) => ({
          id: `project-${index}`,
          type: "projects" as ItemType,
          content: proj,
        })),
        ...talentProfile.publications.map((pub, index) => ({
          id: `publication-${index}`,
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

  useEffect(() => {
    if (onSelectedItemsChange) {
      onSelectedItemsChange(items.preview);
    }
  }, [items.preview, onSelectedItemsChange]);

  useEffect(() => {
    console.log("Current history:", history);
  }, [history]);

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
  const renderCondensedItemContent = (item: Item) => {
    const renderLabel = (label: string) => (
      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mr-2 mb-2">
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
            <div className="space-y-1">
              {renderLabel("Personal")}
              <h3 className="text-lg font-semibold text-gray-800">Location</h3>
              <p className="text-sm text-gray-600">
                {locationString || "Not specified"}
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-1">
            {renderLabel("Personal")}
            <h3 className="text-lg font-semibold text-gray-800">
              {item.content.key}
            </h3>
            <p className="text-sm text-gray-600">
              {item.content.value || "Not specified"}
            </p>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-1">
            {renderLabel("Experience")}
            <h4 className="text-base font-semibold text-gray-800">
              {item.content.job_title}
            </h4>
            <p className="text-sm text-gray-600">{item.content.organization}</p>
          </div>
        );
      case "education":
        return (
          <div className="space-y-1">
            {renderLabel("Education")}
            <h4 className="text-base font-semibold text-gray-800">
              {item.content.degree}
            </h4>
            <p className="text-sm text-gray-600">{item.content.institution}</p>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-1">
            {renderLabel("Skills")}
            <h4 className="text-base font-semibold text-gray-800">Skills</h4>
            <p className="text-sm text-gray-600">
              {item.content.value.length} skills
            </p>
          </div>
        );
      case "certifications":
        return (
          <div className="space-y-1">
            {renderLabel("Certification")}
            <h4 className="text-base font-semibold text-gray-800">
              {item.content.name}
            </h4>
            <p className="text-sm text-gray-600">
              {item.content.issuing_organization}
            </p>
          </div>
        );
      case "projects":
        return (
          <div className="space-y-1">
            {renderLabel("Project")}
            <h4 className="text-base font-semibold text-gray-800">
              {item.content.title}
            </h4>
          </div>
        );
      case "publications":
        return (
          <div className="space-y-1">
            {renderLabel("Publication")}
            <h4 className="text-base font-semibold text-gray-800">
              {item.content.title}
            </h4>
          </div>
        );
      default:
        return null;
    }
  };

  const renderItemContent = (item: Item) => {
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
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800">Location</h3>
              <p className="text-base text-gray-600">
                {locationString || "Not specified"}
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {item.content.key}
            </h3>
            <p className="text-base text-gray-600">
              {item.content.value || "Not specified"}
            </p>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-1 mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {item.content.job_title}
            </h4>
            <p className="text-base font-medium text-gray-700">
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
          <div className="space-y-1 mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {item.content.degree}
            </h4>
            <p className="text-base font-medium text-gray-700">
              {item.content.institution}
            </p>
            <p className="text-sm text-gray-600">{`${item.content.start_date} - ${item.content.end_date}`}</p>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-1">
            <ul className="list-disc list-inside text-sm text-gray-700 columns-2">
              {item.content.value.map(
                (skill: { name: string }, index: number) => (
                  <li key={index}>{skill.name}</li>
                )
              )}
            </ul>
          </div>
        );
      case "certifications":
        return (
          <div className="space-y-1 mb-2">
            <h4 className="text-base font-semibold text-gray-800">
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
          <div className="space-y-1 mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {item.content.title}
            </h4>
            <p className="text-sm text-gray-700">{item.content.description}</p>
          </div>
        );
      case "publications":
        return (
          <div className="space-y-1 mb-4">
            <h4 className="text-base font-semibold text-gray-800">
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
              <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
