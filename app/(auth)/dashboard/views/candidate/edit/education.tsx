import React, { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
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
  const { user } = useStore();
  const [educations, setEducations] = useState<EducationWithTempId[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchEducations = async () => {
      if (user?.uuid) {
        try {
          const fetchedEducations = await getTalentEducation(user.uuid);
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
  }, [user]);

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

  const handleSave = async (education: EducationWithTempId) => {
    setLoadingState(education._id, true);
    try {
      if (isTempEducation(education)) {
        if (user?.uuid) {
          const newEducation = await addEducation(user.uuid, education);
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
          throw new Error("User UUID is not available");
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
    return <div>Loading...</div>;
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
              <Label htmlFor={`institution-${education._id}`}>Institution</Label>
              <Input
                id={`institution-${education._id}`}
                value={education.institution}
                onChange={(e) =>
                  handleInputChange(education._id, "institution", e.target.value)
                }
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`start-date-${education._id}`}>Start Date</Label>
              <Input
                id={`start-date-${education._id}`}
                value={education.start_date}
                onChange={(e) =>
                  handleInputChange(education._id, "start_date", e.target.value)
                }
                placeholder="eg. 9/2020 or September 2020"
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`end-date-${education._id}`}>End Date</Label>
              <Input
                id={`end-date-${education._id}`}
                value={education.end_date}
                onChange={(e) =>
                  handleInputChange(education._id, "end_date", e.target.value)
                }
                placeholder="eg. 5/2024, May 2024, or Present"
                disabled={loadingStates[education._id.toString()]}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`honors-awards-${education._id}`}>Honors, Awards & Relevant Coursework</Label>
              <Textarea
                id={`honors-awards-${education._id}`}
                value={education.honors_awards_coursework || ''}
                onChange={(e) =>
                  handleInputChange(education._id, "honors_awards_coursework", e.target.value)
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
    </div>
  );
}