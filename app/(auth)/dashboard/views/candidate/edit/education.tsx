import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import {
  getTalentEducation,
  updateNodeProperty,
  addEducation,
  removeEducation,
  EducationNode,
  NodeWithId,
} from "@/lib/candidate/global/mutation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MonthYearPicker } from "@/app/(auth)/dashboard/views/candidate/assets/date-picker-my";
import LoadingState from "@/app/(auth)/dashboard/views/candidate/edit/loader";
import InitialInfoDialog from "@/app/(auth)/dashboard/views/candidate/edit/info-alert";

type BaseEducation = Omit<EducationNode, "_id"> & {
  labels?: string[];
  honors_awards_coursework?: string;
};

interface Neo4jEducation extends NodeWithId, Omit<BaseEducation, "labels"> {
  labels: string[];
}
interface TempEducation extends BaseEducation {
  _id: string;
  labels: string[];
}

type EducationWithTempId = Neo4jEducation | TempEducation;

const isTempEducation = (
  education: EducationWithTempId
): education is TempEducation => {
  return typeof education._id === "string";
};

export default function Education() {
  const { user: clerkUser } = useUser();
  const [educations, setEducations] = useState<EducationWithTempId[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;
  const dialogDismissed =
    (clerkUser?.publicMetadata?.["2"] as string) === "true";
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(!dialogDismissed);

  useEffect(() => {
    const fetchEducations = async () => {
      if (candidateId) {
        try {
          const fetchedEducations = await getTalentEducation(candidateId);
          setEducations(fetchedEducations);
        } catch (error) {
          console.error("Error fetching educations:", error);
          toast.error("Failed to load educations. Please try again.");
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    fetchEducations();
  }, [candidateId]);

  const setLoadingState = (id: string | number, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id.toString()]: isLoading }));
  };

  const handleInputChange = (
    id: string | number,
    field: keyof BaseEducation,
    value: string
  ) => {
    setEducations((prevEducations) =>
      prevEducations.map((edu) =>
        edu._id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const handleDateChange = (
    id: string | number,
    field: "start_date" | "end_date",
    value: string | undefined
  ) => {
    setEducations((prevEducations) =>
      prevEducations.map((edu) =>
        edu._id === id ? { ...edu, [field]: value || "" } : edu
      )
    );
  };

  const handleSave = async (education: EducationWithTempId) => {
    setLoadingState(education._id, true);
    try {
      if (isTempEducation(education)) {
        if (candidateId) {
          const newEducation = await addEducation(candidateId, education);
          if (newEducation) {
            setEducations((prevEducations) =>
              prevEducations.map((edu) =>
                edu._id === education._id ? newEducation : edu
              )
            );
            toast.success("New education added successfully!");
          } else {
            throw new Error("Failed to add new education");
          }
        } else {
          throw new Error("User ID is not available");
        }
      } else {
        for (const [key, value] of Object.entries(education)) {
          if (key !== "_id" && key !== "labels") {
            await updateNodeProperty({
              nodeId: education._id,
              propertyName: key as keyof BaseEducation,
              propertyValue: value,
            });
          }
        }
        toast.success("Education updated successfully!");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Failed to save education. Please try again.");
    } finally {
      setLoadingState(education._id, false);
    }
  };

  const addNewEducation = () => {
    const newId = `new-${Date.now()}`;
    const newEducation: TempEducation = {
      _id: newId,
      degree: "",
      institution: "",
      start_date: "",
      end_date: "",
      honors_awards_coursework: "",
      labels: ["Education"],
    };
    setEducations((prevEducations) => [...prevEducations, newEducation]);
  };

  const removeEducationItem = async (id: string | number) => {
    setLoadingState(id, true);
    try {
      if (typeof id === "string") {
        setEducations((prevEducations) =>
          prevEducations.filter((edu) => edu._id !== id)
        );
      } else {
        const success = await removeEducation(id);
        if (success) {
          setEducations((prevEducations) =>
            prevEducations.filter((edu) => edu._id !== id)
          );
          toast.success("Education removed successfully");
        } else {
          throw new Error("Failed to remove education");
        }
      }
    } catch (error) {
      console.error("Error removing education:", error);
      toast.error(
        "An error occurred while removing the education. Please try again."
      );
    } finally {
      setLoadingState(id, false);
    }
  };

  if (isInitialLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {educations.map((education) => (
        <div
          key={education._id.toString()}
          className="border p-4 rounded-md space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {education.degree || "New Education"}
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducationItem(education._id)}
                  disabled={loadingStates[education._id.toString()]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-0">
                <p>Remove {education.degree || "this education"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`degree-${education._id}`}>Degree</Label>
              <Input
                id={`degree-${education._id}`}
                value={education.degree}
                onChange={(e) =>
                  handleInputChange(education._id, "degree", e.target.value)
                }
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`institution-${education._id}`}>
                Institution
              </Label>
              <Input
                id={`institution-${education._id}`}
                value={education.institution}
                onChange={(e) =>
                  handleInputChange(
                    education._id,
                    "institution",
                    e.target.value
                  )
                }
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`start-date-${education._id}`}>Start Date</Label>
              <MonthYearPicker
                value={education.start_date}
                onChange={(value) =>
                  handleDateChange(education._id, "start_date", value)
                }
                allowPresent={false}
              />
            </div>
            <div>
              <Label htmlFor={`end-date-${education._id}`}>End Date</Label>
              <MonthYearPicker
                value={education.end_date}
                onChange={(value) =>
                  handleDateChange(education._id, "end_date", value)
                }
                allowPresent={true}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`honors-awards-${education._id}`}>
                Honors, Awards & Relevant Coursework
              </Label>
              <Textarea
                id={`honors-awards-${education._id}`}
                value={education.honors_awards_coursework || ""}
                onChange={(e) =>
                  handleInputChange(
                    education._id,
                    "honors_awards_coursework",
                    e.target.value
                  )
                }
                placeholder="e.g., Dean's List, Advanced Machine Learning Course"
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
          </div>
          <Button
            onClick={() => handleSave(education)}
            disabled={loadingStates[education._id.toString()]}
          >
            {loadingStates[education._id.toString()] ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      ))}
      <Button onClick={addNewEducation} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add New Education
      </Button>
      {!dialogDismissed && (
        <InitialInfoDialog
          open={isInfoDialogOpen}
          onOpenChange={setIsInfoDialogOpen}
        />
      )}
    </div>
  );
}
