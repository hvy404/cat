import React, { useState, useEffect, useRef } from "react";
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
import Container from "./container";
import SortableItem from "./sortable";
import {
  Item,
  ItemType,
  CustomItem,
  HistoryEntry,
  AlertState,
  ResumeBuilderProps,
} from "./types";
import { buildAndLogPrompt } from "./prompt-builder";
import { useDebounce } from "./use-debounce";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "./delete-dialog";
import { AvailableItems } from "./available-items";
import AddSectionDialog from "./add-section-dialog";
import EditDialog from "./edit-dialog";
import { renderCondensedItemContent } from "./condensed-content";
import { createRenderItemContent } from "./render-item-content";
import { generateResume, ResumeData, ResumeItem, DocxCustomSection } from './assemble-docx';


// Add new interfaces for custom sections and items
interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  talentProfile,
  onSelectedItemsChange,
  selectedItems = [],
  selectedRole,
}) => {
  const [items, setItems] = useState<Record<string, Item[]>>({
    available: [],
    preview: selectedItems,
  });
  const [editedItems, setEditedItems] = useState<Record<string, Item>>({});
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alerts, setAlerts] = useState<
    {
      id: string;
      message: {
        recentEdit: string;
        nextAction: "add" | "remove" | "modify" | "none";
        nextReason: string;
      };
      isMinimized: boolean;
    }[]
  >([]);
  const [lastModifiedItemId, setLastModifiedItemId] = useState<string | null>(
    null
  );
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set()
  );

  // Add new state for custom sections
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [isAddingSectionDialogOpen, setIsAddingSectionDialogOpen] =
    useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemToDelete: (CustomItem & { sectionId: string }) | null;
    sectionToDelete: CustomSection | null;
  }>({
    isOpen: false,
    itemToDelete: null,
    sectionToDelete: null,
  });

  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Autoload items to preview
  useEffect(() => {
    if (talentProfile) {
      moveItemsToPreview(["name", "email", "city", "state", "zipcode"]);
    }
  }, []);

  const debouncedBuildAndLogPrompt = useDebounce(
    (items, history, talentProfile, lastModifiedItemId) => {
      setProcessingItems((prevProcessing) =>
        new Set(prevProcessing).add(lastModifiedItemId)
      );

      if (!selectedRole) {
        return;
      }

      return buildAndLogPrompt(items, history, talentProfile, selectedRole)
        .then((result) => {
          if (result) {
            const { recentEdit, nextAction, nextReason } = result;
            setAlerts((prevAlerts) => {
              const newAlert: AlertState = {
                id: lastModifiedItemId,
                message: { recentEdit, nextAction, nextReason },
                isMinimized: false,
              };

              const updatedAlerts = prevAlerts.map((alert) => ({
                ...alert,
                isMinimized: true,
              }));

              return [...updatedAlerts, newAlert];
            });
          }
        })
        .finally(() => {
          setProcessingItems((prevProcessing) => {
            const newProcessing = new Set(prevProcessing);
            newProcessing.delete(lastModifiedItemId);
            return newProcessing;
          });
        });
    },
    3000
  );

  const excludedPersonalItems = [
    "name",
    "email",
    "city",
    "state",
    "zipcode",
    "location",
    "phone",
    "clearance_level",
  ];

  useEffect(() => {
    if (onSelectedItemsChange) {
      onSelectedItemsChange(items.preview);
    }

    if (items.preview.length > 0 && history.length > 0 && lastModifiedItemId) {
      const lastModifiedItem = items.preview.find(
        (item) => item.id === lastModifiedItemId
      );

      const isExcludedPersonalItem =
        lastModifiedItem?.type === "personal" &&
        excludedPersonalItems.includes(lastModifiedItem.content.key);

      if (!isExcludedPersonalItem) {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }

        processingTimeoutRef.current = setTimeout(() => {
          setProcessingItems((prevProcessing) =>
            new Set(prevProcessing).add(lastModifiedItemId)
          );
        }, 3000);

        const updatedItems = {
          ...items,
          preview: items.preview.map((item) => editedItems[item.id] || item),
        };

        debouncedBuildAndLogPrompt(
          updatedItems,
          history,
          talentProfile,
          lastModifiedItemId
        );
      }
    }

    setLastModifiedItemId(null);
  }, [
    items.preview,
    onSelectedItemsChange,
    history,
    talentProfile,
    lastModifiedItemId,
    editedItems,
    debouncedBuildAndLogPrompt,
    excludedPersonalItems,
  ]);

  const toggleAlertMinimize = (id: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id
          ? { ...alert, isMinimized: !alert.isMinimized }
          : { ...alert, isMinimized: true }
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

  // Add new functions for custom sections and items
  const handleAddCustomSection = () => {
    if (newSectionTitle.trim()) {
      const newSection: CustomSection = {
        id: `custom-section-${Date.now()}`,
        title: newSectionTitle.trim(),
        items: [],
      };
      setCustomSections([...customSections, newSection]);
      setNewSectionTitle("");
      setIsAddingSectionDialogOpen(false);
    }
  };

  const handleAddCustomItem = (sectionId: string) => {
    const newItem: CustomItem = {
      id: `custom-item-${Date.now()}`,
      type: "custom",
      content: { text: "" },
      sectionId, // Added this line
    };
    setCustomSections(
      customSections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    );
  };

  const handleEditCustomItem = (
    sectionId: string,
    itemId: string,
    text: string
  ) => {
    setCustomSections(
      customSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, content: { text } } : item
              ),
            }
          : section
      )
    );
  };

  // Modify the Available Items section to include a Custom Card
  const renderAvailableItems = () => (
    <AvailableItems
      items={items.available}
      renderCondensedItemContent={renderCondensedItemContent}
    />
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeItem =
      Object.values(items)
        .flat()
        .find((item) => item.id === active.id) ||
      customSections
        .flatMap((section) => section.items)
        .find((item) => item.id === active.id);
    if (activeItem) {
      setActiveId(active.id as string);
    } else {
      console.warn(`Attempted to drag item with unknown id: ${active.id}`);
      setActiveId(null);
    }
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

      const draggedItem = activeItems[activeIndex];
      const isIntroItem = draggedItem.type === "personal" && draggedItem.content.key === "intro";
      const isExcludedPersonalItem =
        draggedItem.type === "personal" &&
        excludedPersonalItems.includes(draggedItem.content.key);

      if (!isExcludedPersonalItem && !isIntroItem) {
        const action =
          activeContainer === "available" && overContainer === "preview"
            ? ("add" as const)
            : ("remove" as const);
        const newHistoryEntry: HistoryEntry = {
          action,
          itemId: id,
          timestamp: Date.now(),
        };
        setHistory((prevHistory) => [...prevHistory, newHistoryEntry]);
        setLastModifiedItemId(id);
      }

      // Clear any existing timeout when a new drag occurs
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      return newItems;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
        // If dropped outside a custom section, create a new custom section
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

    // Handle custom items
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
            // Reorder within the same section
            const oldIndex = section.items.findIndex((item) => item.id === id);
            const newIndex = section.items.findIndex(
              (item) => item.id === overId
            );
            const newItems = arrayMove(section.items, oldIndex, newIndex);
            return { ...section, items: newItems };
          } else if (section.id === sourceSection.id) {
            // Remove item from source section
            return {
              ...section,
              items: section.items.filter((item) => item.id !== id),
            };
          } else if (section.id === targetSection.id) {
            // Add item to target section
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
      setLastModifiedItemId(id);
      return;
    }

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prevItems) => {
      const activeItems = prevItems[activeContainer];
      const overItems = prevItems[overContainer];

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

      if (activeIndex !== overIndex) {
        const newItems = {
          ...prevItems,
          [overContainer]: arrayMove(
            prevItems[overContainer],
            activeIndex,
            overIndex
          ),
        };

        const movedItem = activeItems[activeIndex];
        const isExcludedPersonalItem =
          movedItem.type === "personal" &&
          excludedPersonalItems.includes(movedItem.content.key);

        if (!isExcludedPersonalItem) {
          const newHistoryEntry: HistoryEntry = {
            action: activeContainer === "available" ? "add" : "remove",
            itemId: id,
            timestamp: Date.now(),
          };
          setHistory((prevHistory) => [...prevHistory, newHistoryEntry]);
          setLastModifiedItemId(id);
        }

        return newItems;
      }

      return prevItems;
    });

    setActiveId(null);
  };

  /* Editor */
  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (editedItem: Item) => {
    setEditedItems((prev) => ({
      ...prev,
      [editedItem.id]: editedItem,
    }));

    if (editedItem.type === "personal") {
      setItems((prevItems) => ({
        ...prevItems,
        preview: prevItems.preview.map((item) =>
          item.id === editedItem.id
            ? {
                ...item,
                content: {
                  ...item.content,
                  value: editedItem.content.value,
                },
              }
            : item
        ),
      }));
    }

    setEditingItem(null);
    setLastModifiedItemId(editedItem.id);
  };

  const renderItemContent = createRenderItemContent(
    editedItems,
    alerts,
    processingItems,
    handleEdit,
    toggleAlertMinimize
  );

  const renderPreview = () => {
    if (!items.preview) {
      console.error("Preview items are undefined");
      return null;
    }

    const groupedItems = items.preview.reduce((acc, item) => {
      if (item.type === "personal" && item.content.key === "intro") {
        if (!acc["introduction"]) acc["introduction"] = [];
        acc["introduction"].push(item);
      } else {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
      }
      return acc;
    }, {} as Record<ItemType | "introduction", Item[]>);

    const sectionOrder: (ItemType | "introduction")[] = [
      "personal",
      "introduction",
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
                {sectionType === "introduction" ? "Introduction" : sectionType}
              </h2>
              {sectionType === "personal" ? (
                <div className="grid grid-cols-2 gap-4">
                  {groupedItems[sectionType].map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <div className="relative">{renderItemContent(item)}</div>
                    </SortableItem>
                  ))}
                </div>
              ) : (
                groupedItems[sectionType].map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="relative">{renderItemContent(item)}</div>
                  </SortableItem>
                ))
              )}
            </div>
          );
        })}

        {/* Render custom sections */}
        {customSections.map((section) => (
          <div
            key={section.id}
            className="pb-4 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 uppercase">
                {section.title}
              </h2>
              <Button
                onClick={() => handleDeleteCustomSection(section.id)}
                variant="ghost"
                size="sm"
              >
                <Trash2 size={16} className="text-gray-400" />
              </Button>
            </div>
            {section.items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                <div className="relative">
                  <div className="flex justify-between items-start">
                    <Textarea
                      value={item.content.text}
                      onChange={(e) =>
                        handleEditCustomItem(
                          section.id,
                          item.id,
                          e.target.value
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                    <Button
                      onClick={() =>
                        setDeleteConfirmation({
                          isOpen: true,
                          itemToDelete: { ...item, sectionId: section.id },
                          sectionToDelete: null,
                        })
                      }
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    >
                      <Trash2 size={16} className="text-gray-400" />
                    </Button>
                  </div>
                </div>
              </SortableItem>
            ))}
            <Button
              onClick={() => handleAddCustomItem(section.id)}
              className="mt-2"
              variant="outline"
            >
              Add Custom Item
            </Button>
          </div>
        ))}

        {/* Add Custom Section button */}
        <Button
          onClick={() => setIsAddingSectionDialogOpen(true)}
          className="mt-4"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Custom Section
        </Button>
        <DeleteConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() =>
            setDeleteConfirmation({
              isOpen: false,
              itemToDelete: null,
              sectionToDelete: null,
            })
          }
          onConfirm={confirmDelete}
          itemType={deleteConfirmation.itemToDelete ? "item" : "section"}
        />
      </div>
    );
  };

  const handleDeleteCustomItem = (sectionId: string, itemId: string) => {
    setCustomSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section
      )
    );
    setLastModifiedItemId(itemId);
  };

  const handleDeleteCustomSection = (sectionId: string) => {
    const sectionToDelete = customSections.find(
      (section) => section.id === sectionId
    );
    setDeleteConfirmation({
      isOpen: true,
      itemToDelete: null,
      sectionToDelete: sectionToDelete || null, // Use null if section is not found
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.itemToDelete) {
      handleDeleteCustomItem(
        deleteConfirmation.itemToDelete.sectionId,
        deleteConfirmation.itemToDelete.id
      );
    } else if (deleteConfirmation.sectionToDelete) {
      setCustomSections((prevSections) =>
        prevSections.filter(
          (section) => section.id !== deleteConfirmation.sectionToDelete!.id
        )
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      itemToDelete: null,
      sectionToDelete: null,
    });
  };

  const handleCreateResume = async () => {
    try {
      const resumeData: ResumeData = items.preview.map((item): ResumeItem => {
        const editedItem = editedItems[item.id] || item;
        return {
          type: editedItem.type,
          content: editedItem.content,
        };
      });

      console.log(resumeData);
  
      // Add custom sections to the resumeData
      customSections.forEach((section) => {
        resumeData.push({
          type: 'custom',
          title: section.title,
          items: section.items.map((item) => ({
            type: 'custom',
            content: { text: item.content.text },
          })),
        } as DocxCustomSection);
      });
  
      const base64Data = await generateResume(resumeData, "modern");
      
      if (!base64Data) {
        throw new Error('Failed to generate resume: base64Data is empty');
      }
  
      // Convert base64 to Blob
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'resume.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating resume:', error);
      // You might want to show an error message to the user here
    }
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
        {renderAvailableItems()}
        <div className="w-2/3 flex flex-col">
          <h2 className="text-md font-semibold text-gray-800 mb-4">
            Resume Preview
          </h2>
          <div className="flex-1 overflow-y-auto pr-4">
            <Container
              id="preview"
              items={[
                ...items.preview,
                ...customSections.flatMap((section) => section.items),
              ]}
            >
              {renderPreview()}
            </Container>
          </div>
          <div className="flex justify-end mt-4">
          <Button onClick={handleCreateResume}>Create Resume</Button>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded-lg p-4">
            {activeId === "custom-card" ? (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-800">
                  Custom Card
                </h3>
                <p className="text-sm text-gray-600">
                  Drag to add a custom item
                </p>
              </div>
            ) : (
              (() => {
                const container = findContainer(activeId);
                const item = container
                  ? items[container]?.find((item) => item.id === activeId) ||
                    customSections
                      .flatMap((section) => section.items)
                      .find((item) => item.id === activeId)
                  : undefined;
                return renderItemContent(item);
              })()
            )}
          </div>
        ) : null}
      </DragOverlay>
      <AddSectionDialog
        isOpen={isAddingSectionDialogOpen}
        onOpenChange={setIsAddingSectionDialogOpen}
        newSectionTitle={newSectionTitle}
        setNewSectionTitle={setNewSectionTitle}
        handleAddCustomSection={handleAddCustomSection}
      />

      <EditDialog
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        handleSaveEdit={handleSaveEdit}
      />
    </DndContext>
  );
};

export default ResumeBuilder;