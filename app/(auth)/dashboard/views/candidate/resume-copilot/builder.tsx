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
import { TalentProfile } from "./get-data";
import Container from "./container";
import SortableItem from "./sortable";
import { Item, ItemType, CustomItem } from "./types";
import Alert from "./alert";
import { buildAndLogPrompt } from "./prompt-builder";
import { useDebounce } from "./use-debounce";
import Spinner from "./spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Plus, Trash2 } from "lucide-react";

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
  message: {
    recentEdit: string;
    nextAction: "add" | "remove" | "modify" | "none";
    nextReason: string;
  };
  isMinimized: boolean;
}

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

  useEffect(() => {
    console.log("Current alerts:", alerts);
  }, [alerts]);

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
    (items, history, talentProfile, lastModifiedItemId) => {
      setProcessingItems((prevProcessing) =>
        new Set(prevProcessing).add(lastModifiedItemId)
      );

      return buildAndLogPrompt(items, history, talentProfile, "Data Scientist")
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

  /* Custom cards */
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
  /* End custom cards */

  /* Custom cards dialog */
  // Add Custom Section Dialog
  const renderAddSectionDialog = () => (
    <Dialog
      open={isAddingSectionDialogOpen}
      onOpenChange={setIsAddingSectionDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Section</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCustomSection();
          }}
        >
          <Input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Enter section title"
            className="mb-4"
          />
          <Button type="submit">Add Section</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Modify the Available Items section to include a Custom Card
  const renderAvailableItems = () => (
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
  );
  /* End custom card diaglog */

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
      const isExcludedPersonalItem =
        draggedItem.type === "personal" &&
        excludedPersonalItems.includes(draggedItem.content.key);

      if (!isExcludedPersonalItem) {
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

  const renderEditDialog = () => {
    if (!editingItem) return null;

    const fields = getFieldsForItemType(
      editingItem.type,
      editingItem.content.key
    );

    return (
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingItem.type}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit(editingItem);
            }}
          >
            {fields.map((field) => (
              <div key={field} className="mb-4">
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700"
                >
                  {editingItem.type === "personal" && field === "value"
                    ? editingItem.content.key
                    : editingItem.type === "skills"
                    ? "Skills"
                    : fieldLabels[field] || field}
                </label>
                {field === "honors_awards_coursework" ||
                field === "responsibilities" ||
                editingItem.type === "skills" ? (
                  <Textarea
                    id={field}
                    value={
                      editingItem.type === "skills"
                        ? editingItem.content.value
                        : editingItem.content[field] || ""
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        content:
                          editingItem.type === "skills"
                            ? { ...editingItem.content, value: e.target.value }
                            : {
                                ...editingItem.content,
                                [field]: e.target.value,
                              },
                      })
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    id={field}
                    value={
                      editingItem.type === "personal"
                        ? editingItem.content.value
                        : editingItem.content[field] || ""
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        content:
                          editingItem.type === "personal"
                            ? { ...editingItem.content, value: e.target.value }
                            : {
                                ...editingItem.content,
                                [field]: e.target.value,
                              },
                      })
                    }
                  />
                )}
              </div>
            ))}
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const getFieldsForItemType = (type: ItemType, key?: string): string[] => {
    switch (type) {
      case "personal":
        return [key || ""];
      case "experience":
        return [
          "job_title",
          "organization",
          "start_date",
          "end_date",
          "responsibilities",
        ];
      case "education":
        return [
          "degree",
          "institution",
          "start_date",
          "end_date",
          "honors_awards_coursework",
        ];
      case "skills":
        return ["value"];
      case "certifications":
        return ["name", "issuing_organization", "date_obtained"];
      case "projects":
        return ["title", "description"];
      case "publications":
        return ["title", "journal_or_conference", "publication_date"];
      default:
        return [];
    }
  };

  const fieldLabels: Record<string, string> = {
    job_title: "Job Title",
    organization: "Organization",
    start_date: "Start Date",
    end_date: "End Date",
    responsibilities: "Responsibilities",
    degree: "Degree",
    institution: "Institution",
    honors_awards_coursework: "Honors, Awards & Coursework",
    name: "Name",
    issuing_organization: "Issuing Organization",
    date_obtained: "Date Obtained",
    title: "Title",
    description: "Description",
    journal_or_conference: "Journal/Conference",
    publication_date: "Publication Date",
  };
  /* Editor End */

  const renderItemContent = (item: Item | undefined) => {
    if (!item) {
      console.warn("Attempted to render undefined item");
      return null;
    }

    const editedItem = editedItems[item.id] || item;

    const content = (() => {
      switch (editedItem.type) {
        case "personal":
          if (editedItem.content.key === "Location") {
            const { city, state, zipcode } = editedItem.content.value as {
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
                {personalLabelMap[editedItem.content.key] ||
                  editedItem.content.key}
              </h3>
              <p className="text-sm text-gray-600">
                {editedItem.content.value || "Not specified"}
              </p>
            </div>
          );
        case "experience":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.job_title}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {editedItem.content.organization}
              </p>
              <p className="text-sm text-gray-600">{`${editedItem.content.start_date} - ${editedItem.content.end_date}`}</p>
              <p className="text-sm text-gray-700 mt-2">
                {editedItem.content.responsibilities}
              </p>
            </div>
          );
        case "education":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.degree}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {editedItem.content.institution}
              </p>
              <p className="text-sm text-gray-600">{`${editedItem.content.start_date} - ${editedItem.content.end_date}`}</p>
            </div>
          );
        case "skills":
          return (
            <div className="space-y-1 select-none">
              <h3 className="text-md font-semibold text-gray-800">Skill</h3>
              <p className="text-sm text-gray-600">
                {editedItem.content.value}
              </p>
            </div>
          );
        case "certifications":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {editedItem.content.name}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.issuing_organization}
              </p>
              <p className="text-sm text-gray-600">{`Obtained: ${editedItem.content.date_obtained}`}</p>
            </div>
          );
        case "projects":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.description}
              </p>
            </div>
          );
        case "publications":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {editedItem.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.journal_or_conference}
              </p>
              <p className="text-sm text-gray-600">{`Published: ${editedItem.content.publication_date}`}</p>
            </div>
          );
        default:
          return null;
      }
    })();

    const itemAlert = alerts.find((alert) => alert.id === editedItem.id);
    const isProcessing = processingItems.has(editedItem.id);

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-grow pr-10">{content}</div>
          <Button
            onClick={() => handleEdit(editedItem)}
            className="flex-shrink-0 p-1 h-6 w-6"
            variant="ghost"
          >
            <Edit2 size={16} className="text-gray-400" />
          </Button>
        </div>
        <div className="mt-auto pt-2">
          {isProcessing ? (
            <div className="flex items-center justify-center h-8">
              <Spinner />
            </div>
          ) : itemAlert ? (
            <Alert
              message={itemAlert.message}
              isMinimized={itemAlert.isMinimized}
              onToggleMinimize={() => toggleAlertMinimize(editedItem.id)}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!items.preview) {
      console.error("Preview items are undefined");
      return null;
    }

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

  const DeleteConfirmationDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemType: "item" | "section";
  }> = ({ isOpen, onClose, onConfirm, itemType }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to delete this {itemType}?
            {itemType === "section" && " This will delete all items within it."}
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={onConfirm} variant="destructive">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleCreateResume = () => {
    const resumeData = items.preview.map((item) => {
      const editedItem = editedItems[item.id] || item;
      return {
        type: editedItem.type,
        content: editedItem.content,
      };
    });

    // Add custom sections and items to the resumeData
    const customSectionsData = customSections.map((section) => ({
      type: "custom",
      title: section.title,
      items: section.items.map((item) => ({
        type: "custom",
        content: item.content,
      })),
    }));

    const fullResumeData = [...resumeData, ...customSectionsData];

    console.log(JSON.stringify(fullResumeData, null, 2));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {renderEditDialog()}
      {renderAddSectionDialog()}
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
    </DndContext>
  );
};

export default ResumeBuilder;
