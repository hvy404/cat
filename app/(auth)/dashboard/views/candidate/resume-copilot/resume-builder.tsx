import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './sortable';
import { Container } from './container';

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'row' as const,
  width: '100%',
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  width: '50%',
  minHeight: '80vh',
  border: '1px solid #ccc',
  borderRadius: '5px',
  padding: '10px',
  margin: '10px',
};

export function ResumeBuilder({ talentProfile }) {
  const [availableItems, setAvailableItems] = useState(generateInitialItems(talentProfile));
  const [resumeItems, setResumeItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function generateInitialItems(profile) {
    let items = [];
    if (profile.talent) {
      items.push({ id: 'personal-info', type: 'personal', content: profile.talent });
    }
    if (profile.education) {
      profile.education.forEach((edu, index) => {
        items.push({ id: `education-${index}`, type: 'education', content: edu });
      });
    }
    if (profile.workExperiences) {
      profile.workExperiences.forEach((exp, index) => {
        items.push({ id: `experience-${index}`, type: 'experience', content: exp });
      });
    }
    if (profile.skills) {
      items.push({ id: 'skills', type: 'skills', content: profile.skills });
    }
    return items;
  }

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;
    
    if (activeContainer !== overContainer) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      
      let newIndex;
      if (overContainer === 'resume') {
        newIndex = overIndex;
      } else {
        newIndex = resumeItems.length + 1;
      }

      const nextResumeItems = [...resumeItems];
      const nextAvailableItems = [...availableItems];

      if (activeContainer === 'available') {
        nextResumeItems.splice(newIndex, 0, availableItems[activeIndex]);
        nextAvailableItems.splice(activeIndex, 1);
      } else {
        nextAvailableItems.push(resumeItems[activeIndex]);
        nextResumeItems.splice(activeIndex, 1);
      }

      setResumeItems(nextResumeItems);
      setAvailableItems(nextAvailableItems);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const activeContainer = active.data.current.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;
      
      if (activeContainer === overContainer) {
        const items = activeContainer === 'available' ? availableItems : resumeItems;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        if (activeContainer === 'available') {
          setAvailableItems(newItems);
        } else {
          setResumeItems(newItems);
        }
      }
    }
    
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={wrapperStyle}>
        <div style={columnStyle}>
          <h2>Available Items</h2>
          <Container id="available">
            <SortableContext items={availableItems} strategy={rectSortingStrategy}>
              {availableItems.map((item) => (
                <SortableItem key={item.id} id={item.id} item={item} />
              ))}
            </SortableContext>
          </Container>
        </div>
        <div style={columnStyle}>
          <h2>Resume</h2>
          <Container id="resume">
            <SortableContext items={resumeItems} strategy={rectSortingStrategy}>
              {resumeItems.map((item) => (
                <SortableItem key={item.id} id={item.id} item={item} />
              ))}
            </SortableContext>
          </Container>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <SortableItem
            id={activeId}
            item={[...availableItems, ...resumeItems].find((item) => item.id === activeId)}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}