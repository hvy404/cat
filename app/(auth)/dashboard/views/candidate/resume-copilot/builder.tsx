import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  ResumeBuilderProps,
  QueueItem,
} from "./types";
import { buildEditReview } from "./prompt-builder"; // AI Call
import { suggestNextSteps } from "./next-steps"; // AI Call #2
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Download } from "lucide-react";
import { DeleteConfirmationDialog } from "./delete-dialog";
import { AvailableItems } from "./available-items";
import AddSectionDialog from "./add-section-dialog";
import EditDialog from "./edit-dialog";
import { renderCondensedItemContent } from "./condensed-content";
import { createRenderItemContent } from "./render-item-content";
import {
  generateResume,
  ResumeData,
  ResumeItem,
  DocxCustomSection,
} from "./assemble-docx";
import TemplateSelectionDialog from "./template-selection";
import SaveResumeDialog from "./save-resume-dialog";
import { uploadResumeAction } from "./resume-upload";
import { addResumeEntryAction } from "./add-resume-entry";
import createId from "@/lib/global/cuid-generate";
import { base64ToBlob } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/convert-to-file";
import { toast } from "sonner";
import {
  addCustomSection,
  addCustomItem,
  editCustomItem,
  deleteCustomItem,
  deleteCustomSection,
} from "./custom-section-utils";
import ProcessingIndicator from "./processing-indicator";
import CopilotTalk from "./copilot-talk";
import ControlPanel from "./control-panel";
import { handleDragEnd } from "./handler-drag-end";
import { handleDragOver } from "./handler-drag-over";

interface BuilderSession {
  sessionId: string;
}

// Add new interfaces for custom sections and items
interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

interface Alert {
  itemId: string;
  message: {
    recommendation: {
      action: "add" | "remove" | "modify" | "none";
      priority: "High" | "Medium" | "Low";
      targetItem: string;
      rationale: string;
      implementation: string;
    };
  };
  isMinimized: boolean;
}

interface NextStep {
  message: string;
  suggestion: string;
  reasoning: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  talentProfile,
  onSelectedItemsChange,
  selectedItems = [],
  selectedRole,
  userId,
}) => {
  const [builderSession, setBuilderSession] = useState<BuilderSession>({
    sessionId: createId(),
  });
  const [items, setItems] = useState<Record<string, Item[]>>({
    available: [],
    chosen: selectedItems,
  });
  const [editedItems, setEditedItems] = useState<Record<string, Item>>({});
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOrigin, setDragOrigin] = useState<string | null>(null);
  const [dragStartContainer, setDragStartContainer] = useState<string | null>(
    null
  );
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [actionHistory, setActionHistory] = useState<
    Array<{
      action: "add" | "remove";
      itemId: string;
      itemType: string;
      fromContainer: string | null;
      toContainer: string | null;
      newIndex: number;
    }>
  >([]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastModifiedItemId, setLastModifiedItemId] = useState<string | null>(
    null
  );
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set()
  );
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const [isSaveVersionDialogOpen, setIsSaveVersionDialogOpen] = useState(false);
  const [filename, setFilename] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatButtonExpanded, setIsChatButtonExpanded] = useState(false);

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

  // New state for next steps
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setIsChatButtonExpanded(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      modifiers: [
        ((args: { event: PointerEvent }) => {
          if (
            args.event.target instanceof Element &&
            args.event.target.closest('[data-no-dnd="true"]')
          ) {
            args.event.stopPropagation();
            return false;
          }
          return true;
        }) as any,
      ],
    } as any),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Presets
  const moveItemsToChosen = (itemKeys: string[]) => {
    setItems((prevItems) => {
      const newAvailable = [...prevItems.available];
      const newChosen = [...prevItems.chosen];

      itemKeys.forEach((key) => {
        const index = newAvailable.findIndex(
          (item) => item.type === "personal" && item.content.key === key
        );
        if (index !== -1) {
          const [item] = newAvailable.splice(index, 1);
          newChosen.push(item);
        }
      });

      return {
        available: newAvailable,
        chosen: newChosen,
      };
    });
  };

  const memoizedAlerts = useMemo(() => alerts, [alerts]);

  useEffect(() => {
    console.log("Current alerts:", alerts);
  }, [alerts]);

  // useEffect console nextSteps on changes
  useEffect(() => {
    console.log("Next steps:", nextSteps);
  }, [nextSteps]);

  // useEffect to console actionHistory on change
  useEffect(() => {
    console.log("History", actionHistory);
  }, [actionHistory]);

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
        chosen: selectedItems,
      }));
    }
  }, [talentProfile, selectedItems]);

  // Autoload items to chosen
  useEffect(() => {
    if (talentProfile) {
      moveItemsToChosen(["name", "email", "city", "state", "zipcode"]);
    }
  }, []);

  const processNextInQueue = useCallback(async () => {
    if (processingQueue.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    const { itemId, cardContent } = processingQueue[0];

    try {
      setProcessingItems((prev) => new Set(prev).add(itemId));

      if (!selectedRole) {
        throw new Error("Selected role is not defined");
      }

      const result = await buildEditReview(
        items,
        talentProfile,
        selectedRole,
        itemId,
        cardContent
      );

      if ("error" in result) {
        console.error(result.error);
      } else {
        setAlerts((prevAlerts) => {
          const newAlert: Alert = {
            itemId: itemId,
            isMinimized: false,
            message: {
              recommendation: {
                action: result.recommendation.action,
                priority: result.recommendation.priority,
                targetItem: result.recommendation.targetItem,
                rationale: result.recommendation.rationale,
                implementation: result.recommendation.implementation,
              },
            },
          };

          const updatedAlerts = prevAlerts.map((alert) => ({
            ...alert,
            isMinimized: true,
          }));

          return [...updatedAlerts, newAlert];
        });

        const nextStepsResult = await suggestNextSteps(
          items,
          talentProfile,
          selectedRole,
          itemId,
          cardContent
        );

        if (!("error" in nextStepsResult)) {
          setNextSteps((prevNextSteps) => {
            const updatedNextSteps = [...prevNextSteps, nextStepsResult];
            setIsChatButtonExpanded(true);
            return updatedNextSteps;
          });
        } else {
          console.error("Error in suggestNextSteps:", nextStepsResult.error);
        }
      }
    } catch (error) {
      console.error("Error processing item:", error);
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setCompletedItems((prev) => new Set(prev).add(itemId));
      setProcessingQueue((prev) => prev.slice(1));
      setIsProcessing(false);
    }
  }, [processingQueue, isProcessing, items, talentProfile, selectedRole]);

  useEffect(() => {
    processNextInQueue();
  }, [processNextInQueue]);

  const handleCardDrop = useCallback((itemId: string, cardContent: any) => {
    setProcessingQueue((prev) => [...prev, { itemId, cardContent }]);
  }, []);

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
    let timeoutId: NodeJS.Timeout | null = null;

    if (onSelectedItemsChange) {
      onSelectedItemsChange(items.chosen);
    }

    if (items.chosen.length > 0 && history.length > 0 && lastModifiedItemId) {
      const lastModifiedItem = items.chosen.find(
        (item) => item.id === lastModifiedItemId
      );

      const isExcludedPersonalItem =
        lastModifiedItem?.type === "personal" &&
        excludedPersonalItems.includes(lastModifiedItem.content.key);

      if (!isExcludedPersonalItem) {
        timeoutId = setTimeout(() => {
          setProcessingItems((prevProcessing) =>
            new Set(prevProcessing).add(lastModifiedItemId)
          );
        }, 1500);
      }
    }

    setLastModifiedItemId(null);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    items.chosen,
    onSelectedItemsChange,
    history,
    lastModifiedItemId,
    excludedPersonalItems,
  ]);

  const toggleAlertMinimize = useCallback((id: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.itemId === id
          ? { ...alert, isMinimized: !alert.isMinimized }
          : { ...alert, isMinimized: true }
      )
    );
  }, []);

  const findContainer = (id: string) => {
    if (id === "chosen") return "chosen";
    return Object.keys(items).find((key) =>
      items[key].some((item) => item.id === id)
    );
  };

  // Add new functions for custom sections and items
  const handleAddCustomSection = () => {
    if (newSectionTitle.trim()) {
      setCustomSections((prevSections) =>
        addCustomSection(prevSections, newSectionTitle)
      );
      setNewSectionTitle("");
      setIsAddingSectionDialogOpen(false);
    }
  };

  const handleAddCustomItem = (sectionId: string) => {
    setCustomSections((prevSections) => addCustomItem(prevSections, sectionId));
  };

  const handleEditCustomItem = (
    sectionId: string,
    itemId: string,
    text: string
  ) => {
    setCustomSections((prevSections) =>
      editCustomItem(prevSections, sectionId, itemId, text)
    );
  };

  // Modify the Available Items section to include a Custom Card
  const renderAvailableItems = useMemo(
    () => (
      <AvailableItems
        items={items.available}
        renderCondensedItemContent={renderCondensedItemContent}
      />
    ),
    [items.available, renderCondensedItemContent]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const id = active.id as string;
      const startContainer = findContainer(id);
      setDragStartContainer(startContainer || null);

      const item =
        items[startContainer as keyof typeof items]?.find(
          (item) => item.id === id
        ) ||
        customSections
          .flatMap((section) => section.items)
          .find((item) => item.id === id);
      setDraggedItem(item || null);
      setActiveId(id);
    },
    [items, customSections, findContainer]
  );

  const handleDragOverCallback = useCallback(
    (event: DragOverEvent) => handleDragOver(event, findContainer, setItems),
    [findContainer, setItems]
  );

  const dragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(
        event,
        items,
        customSections,
        findContainer,
        setItems,
        setCustomSections,
        setDragOrigin,
        setActiveId,
        setDraggedItem,
        dragStartContainer,
        excludedPersonalItems,
        setLastModifiedItemId,
        setActionHistory,
        setProcessingQueue,
        setProcessingItems,
        handleAddCustomItem
      );
    },
    [
      items,
      customSections,
      findContainer,
      setItems,
      setCustomSections,
      setDragOrigin,
      setActiveId,
      setDraggedItem,
      dragStartContainer,
      excludedPersonalItems,
      setLastModifiedItemId,
      setActionHistory,
      setProcessingQueue,
      setProcessingItems,
      handleAddCustomItem,
    ]
  );

  /* Editor */
  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
  }, []);

  const handleSaveEdit = useCallback(
    async (editedItem: Item, regenerateSuggestions: boolean) => {
      setEditedItems((prev) => ({
        ...prev,
        [editedItem.id]: editedItem,
      }));

      if (editedItem.type === "personal") {
        setItems((prevItems) => ({
          ...prevItems,
          chosen: prevItems.chosen.map((item) =>
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

      if (regenerateSuggestions) {
        // Add the edited item to the processing queue
        setProcessingQueue((prevQueue) => [
          ...prevQueue,
          { itemId: editedItem.id, cardContent: editedItem.content },
        ]);

        // Set the item as processing
        setProcessingItems((prev) => new Set(prev).add(editedItem.id));
      }
    },
    [
      setEditedItems,
      setItems,
      setEditingItem,
      setLastModifiedItemId,
      setProcessingQueue,
      setProcessingItems,
    ]
  );

  const renderItemContent = useMemo(
    () =>
      createRenderItemContent(
        editedItems,
        memoizedAlerts, // Use memoizedAlerts instead of alerts
        processingItems,
        handleEdit,
        toggleAlertMinimize,
        (itemId) => <ProcessingIndicator message="Analyzing edit..." />
      ),
    [
      editedItems,
      memoizedAlerts, // Use memoizedAlerts in the dependency array
      processingItems,
      handleEdit,
      toggleAlertMinimize,
    ]
  );

  const handleDeleteCustomSection = (sectionId: string) => {
    const sectionToDelete = customSections.find(
      (section) => section.id === sectionId
    );
    setDeleteConfirmation({
      isOpen: true,
      itemToDelete: null,
      sectionToDelete: sectionToDelete || null,
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
        deleteCustomSection(
          prevSections,
          deleteConfirmation.sectionToDelete!.id
        )
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      itemToDelete: null,
      sectionToDelete: null,
    });
  };

  const renderChosen = useMemo(() => {
    if (!items.chosen) {
      console.error("Chosen items are undefined");
      return null;
    }

    const groupedItems = items.chosen.reduce((acc, item) => {
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
                      <div data-no-dnd="true">{renderItemContent(item)}</div>
                    </SortableItem>
                  ))}
                </div>
              ) : (
                groupedItems[sectionType].map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div data-no-dnd="true">{renderItemContent(item)}</div>
                  </SortableItem>
                ))
              )}
            </div>
          );
        })}

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
  }, [
    items.chosen,
    customSections,
    editedItems,
    renderItemContent,
    handleDeleteCustomSection,
    handleAddCustomItem,
    handleEditCustomItem,
    deleteConfirmation,
    confirmDelete,
  ]);

  const handleDeleteCustomItem = (sectionId: string, itemId: string) => {
    setCustomSections((prevSections) =>
      deleteCustomItem(prevSections, sectionId, itemId)
    );
    setLastModifiedItemId(itemId);
  };

  const handleCreateResume = () => {
    setIsTemplateDialogOpen(true);
  };

  const handleSelectTemplate = async (template: string) => {
    setIsTemplateDialogOpen(false);
    try {
      const resumeData: ResumeData = items.chosen.map((item) => ({
        type: editedItems[item.id]?.type || item.type,
        content: editedItems[item.id]?.content || item.content,
      }));

      // Add custom sections to the resumeData
      customSections.forEach((section) => {
        resumeData.push({
          type: "custom",
          title: section.title,
          items: section.items.map((item) => ({
            type: "custom",
            content: { text: item.content.text },
          })),
        });
      });

      const base64Data = await generateResume(
        resumeData,
        template as "classic" | "modern" | "minimal"
      );

      if (!base64Data) {
        throw new Error("Failed to generate resume: base64Data is empty");
      }

      const blob = base64ToBlob(
        base64Data,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `resume_${template}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error("Failed to generate resume", {
        description:
          "An error occurred while creating your resume. Please try again.",
        duration: 5000,
      });
    }
  };

  // Function to prepare resume data for the template chosen
  const prepareResumeData = (): ResumeData => {
    const resumeData: ResumeData = items.chosen.map((item): ResumeItem => {
      const editedItem = editedItems[item.id] || item;
      return {
        type: editedItem.type,
        content: editedItem.content,
      };
    });

    customSections.forEach((section) => {
      resumeData.push({
        type: "custom",
        title: section.title,
        items: section.items.map((item) => ({
          type: "custom",
          content: { text: item.content.text },
        })),
      } as DocxCustomSection);
    });

    return resumeData;
  };

  /* Save custom */
  const handleSaveVersion = () => {
    setIsSaveVersionDialogOpen(true);
  };

  const handleSaveVersionSubmit = async () => {
    setIsSaveVersionDialogOpen(false);
    if (!filename || !userId) {
      toast.error("Missing information", {
        description: "Filename or user ID is missing. Please try again.",
        duration: 5000,
      });
      return;
    }

    try {
      const resumeData = prepareResumeData();
      const base64Data = await generateResume(resumeData, "modern");

      if (!base64Data) {
        throw new Error("Failed to generate resume: base64Data is empty");
      }

      const blob = base64ToBlob(
        base64Data,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      // Create FormData and append necessary data
      const filenameGen = createId();
      const formData = new FormData();
      formData.append("file", blob, `${filename}.docx`);
      formData.append("userId", userId);
      formData.append("filename", filenameGen);

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await uploadResumeAction(
        formData
      );

      if (uploadError) {
        throw uploadError;
      }

      // Add entry to the database
      if (uploadData) {
        const { data: dbData, error: dbError } = await addResumeEntryAction(
          userId,
          uploadData,
          filename
        );

        if (dbError) {
          throw dbError;
        }
      }

      // Show success toast
      toast.success("Resume version saved successfully!", {
        description: `Your resume "${filename}" has been saved.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error saving resume version:", error);
      toast.error("Failed to save resume version", {
        description:
          "An error occurred while saving your resume. Please try again.",
        duration: 5000,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOverCallback}
      onDragEnd={dragEnd}
    >
      <div className="flex gap-6 h-[calc(100vh-12rem)] overflow-hidden">
        {renderAvailableItems}
        <div className="w-2/3 flex flex-col">
          <h2 className="text-md font-semibold text-gray-800 mb-4">Resume</h2>
          <div className="flex-1 overflow-y-auto pr-4">
            <Container
              id="chosen"
              items={[
                ...items.chosen,
                ...customSections.flatMap((section) => section.items),
              ]}
            >
              {renderChosen}
            </Container>
          </div>
        </div>
        <CopilotTalk
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          nextSteps={nextSteps}
          builderSession={builderSession.sessionId}
        />
        <ControlPanel
          onCreateResume={handleCreateResume}
          onSaveVersion={handleSaveVersion}
          onOpenChat={handleOpenChat}
          isChatButtonExpanded={isChatButtonExpanded}
        />
      </div>
      <DragOverlay>
        {activeId && draggedItem ? (
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
              renderItemContent(draggedItem)
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
      <TemplateSelectionDialog
        isOpen={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onSelectTemplate={handleSelectTemplate}
        resumeData={prepareResumeData()}
      />
      <SaveResumeDialog
        isOpen={isSaveVersionDialogOpen}
        onOpenChange={setIsSaveVersionDialogOpen}
        filename={filename}
        setFilename={setFilename}
        onSave={handleSaveVersionSubmit}
      />
    </DndContext>
  );
};

export default ResumeBuilder;
