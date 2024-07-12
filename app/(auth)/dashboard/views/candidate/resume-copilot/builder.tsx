import React, { useState, useEffect } from 'react';
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

interface ResumeBuilderProps {
  talentProfile: TalentProfile;
  previewMode?: boolean;
  onSelectedItemsChange?: (items: Item[]) => void;
}

type ItemType = 'personal' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'publications';

interface Item {
  id: string;
  type: ItemType;
  content: any;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ talentProfile, previewMode = false, onSelectedItemsChange }) => {
  const [items, setItems] = useState<Record<string, Item[]>>({
    available: [],
    selected: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    if (talentProfile) {
      const availableItems: Item[] = [
        { id: 'personal', type: 'personal', content: talentProfile.talent },
        ...talentProfile.workExperiences.map((exp, index) => ({ id: `experience-${index}`, type: 'experience' as const, content: exp })),
        ...talentProfile.education.map((edu, index) => ({ id: `education-${index}`, type: 'education' as const, content: edu })),
        { id: 'skills', type: 'skills', content: talentProfile.skills },
        ...talentProfile.certifications.map((cert, index) => ({ id: `certification-${index}`, type: 'certifications' as const, content: cert })),
        ...talentProfile.projects.map((proj, index) => ({ id: `project-${index}`, type: 'projects' as const, content: proj })),
        ...talentProfile.publications.map((pub, index) => ({ id: `publication-${index}`, type: 'publications' as const, content: pub })),
      ];
      setItems({ available: availableItems, selected: [] });
    }
  }, [talentProfile]);

  useEffect(() => {
    if (onSelectedItemsChange) {
      onSelectedItemsChange(items.selected);
    }
  }, [items.selected, onSelectedItemsChange]);

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].some(item => item.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (previewMode) return;

    const { active, over } = event;
    const id = active.id as string;
    const overId = over?.id as string;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setItems(prev => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex(item => item.id === id);
      const overIndex = overItems.findIndex(item => item.id === overId);

      let newIndex: number;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        newIndex = isBelowLastItem ? overIndex + 1 : overIndex;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item.id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (previewMode) return;

    const { active, over } = event;
    const id = active.id as string;
    const overId = over?.id as string;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(item => item.id === id);
    const overIndex = items[overContainer].findIndex(item => item.id === overId);

    if (activeIndex !== overIndex) {
      setItems(items => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
      }));
    }

    setActiveId(null);
  };

  const renderItemContent = (item: Item) => {
    switch (item.type) {
      case 'personal':
        return (
          <div>
            <h3 className="text-xl font-bold">{item.content.name}</h3>
            <p className="text-lg">{item.content.title}</p>
            <p>{item.content.email}</p>
          </div>
        );
      case 'experience':
        return (
          <div>
            <h4 className="text-lg font-semibold">{item.content.job_title}</h4>
            <p>{item.content.organization}</p>
            <p>{`${item.content.start_date} - ${item.content.end_date}`}</p>
            <p>{item.content.responsibilities}</p>
          </div>
        );
      case 'education':
        return (
          <div>
            <h4 className="text-lg font-semibold">{item.content.degree}</h4>
            <p>{item.content.institution}</p>
            <p>{`${item.content.start_date} - ${item.content.end_date}`}</p>
          </div>
        );
      case 'skills':
        return (
          <div>
            <h4 className="text-lg font-semibold">Skills</h4>
            <ul className="list-disc list-inside">
              {item.content.map((skill: { name: string }, index: number) => (
                <li key={index}>{skill.name}</li>
              ))}
            </ul>
          </div>
        );
      case 'certifications':
        return (
          <div>
            <h4 className="text-lg font-semibold">{item.content.name}</h4>
            <p>{item.content.issuing_organization}</p>
            <p>{`Obtained: ${item.content.date_obtained}`}</p>
          </div>
        );
      case 'projects':
        return (
          <div>
            <h4 className="text-lg font-semibold">{item.content.title}</h4>
            <p>{item.content.description}</p>
          </div>
        );
      case 'publications':
        return (
          <div>
            <h4 className="text-lg font-semibold">{item.content.title}</h4>
            <p>{item.content.journal_or_conference}</p>
            <p>{`Published: ${item.content.publication_date}`}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (previewMode) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4">
        {items.selected.map((item) => (
          <div key={item.id} className="mb-4">
            {renderItemContent(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Available Items</h2>
          <Container id="available" items={items.available}>
            {items.available.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {renderItemContent(item)}
              </SortableItem>
            ))}
          </Container>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Selected Items</h2>
          <Container id="selected" items={items.selected}>
            {items.selected.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {renderItemContent(item)}
              </SortableItem>
            ))}
          </Container>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded-lg p-4">
            {renderItemContent(items[findContainer(activeId)!].find(item => item.id === activeId)!)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ResumeBuilder;