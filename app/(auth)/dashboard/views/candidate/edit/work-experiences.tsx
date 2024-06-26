import React, { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  getTalentWorkExperiences,
  updateNodeProperty,
  addNewWorkExperience,
  removeWorkExperience,
  WorkExperienceNode,
  NodeWithId,
} from "@/lib/candidate/dashboard/mutation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the base WorkExperience type without _id
type BaseWorkExperience = Omit<WorkExperienceNode, '_id'>;

// Define separate interfaces for Neo4j and temporary experiences
interface Neo4jWorkExperience extends BaseWorkExperience, NodeWithId {}
interface TempWorkExperience extends BaseWorkExperience {
  _id: string;
}

// Union type for all possible work experience types
type WorkExperienceWithTempId = Neo4jWorkExperience | TempWorkExperience;

const isTempExperience = (experience: WorkExperienceWithTempId): experience is TempWorkExperience => {
  return typeof experience._id === 'string';
};

export default function WorkExperiences() {
  const { user } = useStore();
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceWithTempId[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchWorkExperiences = async () => {
      if (user?.uuid) {
        try {
          const experiences = await getTalentWorkExperiences(user.uuid);
          setWorkExperiences(experiences);
        } catch (error) {
          console.error("Error fetching work experiences:", error);
          toast.error("Failed to load work experiences. Please try again.");
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    fetchWorkExperiences();
  }, [user]);

  const setLoadingState = (id: string | number, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id.toString()]: isLoading }));
  };

  const handleInputChange = (
    id: string | number,
    field: keyof BaseWorkExperience,
    value: string
  ) => {
    setWorkExperiences((prevExperiences) =>
      prevExperiences.map((exp) =>
        exp._id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const handleSave = async (experience: WorkExperienceWithTempId) => {
    setLoadingState(experience._id, true);
    try {
      if (isTempExperience(experience)) {
        // This is a new experience that needs to be added to Neo4j
        if (user?.uuid) {
          const newExperience = await addNewWorkExperience(user.uuid, experience);
          if (newExperience) {
            setWorkExperiences((prevExperiences) =>
              prevExperiences.map((exp) =>
                exp._id === experience._id ? newExperience : exp
              )
            );
            toast.success("New work experience added successfully!");
          } else {
            throw new Error("Failed to add new work experience");
          }
        } else {
          throw new Error("User UUID is not available");
        }
      } else {
        // This is an existing experience that needs to be updated
        for (const [key, value] of Object.entries(experience)) {
          if (key !== "_id" && key !== "labels") {
            await updateNodeProperty({
              nodeId: experience._id,
              propertyName: key as keyof BaseWorkExperience,
              propertyValue: value,
            });
          }
        }
        toast.success("Work experience updated successfully!");
      }
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast.error("Failed to save work experience. Please try again.");
    } finally {
      setLoadingState(experience._id, false);
    }
  };

  const addNewExperience = () => {
    const newId = `new-${Date.now()}`;
    const newExperience: TempWorkExperience = {
      _id: newId,
      job_title: "",
      organization: "",
      start_date: "",
      end_date: "",
      responsibilities: "",
      labels: ["WorkExperience"]
    };
    setWorkExperiences((prevExperiences) => [...prevExperiences, newExperience]);
  };

  const removeExperience = async (id: string | number) => {
    setLoadingState(id, true);
    try {
      if (typeof id === "string") {
        // This is a new, unsaved experience. Just remove it from the state.
        setWorkExperiences((prevExperiences) => 
          prevExperiences.filter((exp) => exp._id !== id)
        );
      } else {
        // This is an existing experience in Neo4j. Remove it from the database.
        const success = await removeWorkExperience(id);
        if (success) {
          setWorkExperiences((prevExperiences) => 
            prevExperiences.filter((exp) => exp._id !== id)
          );
          toast.success("Work experience removed successfully");
        } else {
          throw new Error("Failed to remove work experience");
        }
      }
    } catch (error) {
      console.error("Error removing work experience:", error);
      toast.error(
        "An error occurred while removing the work experience. Please try again."
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
      <h2 className="text-2xl font-bold">Work Experiences</h2>
      {workExperiences.map((experience) => (
        <div key={experience._id.toString()} className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {experience.job_title || "New Experience"}
            </h3>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExperience(experience._id)}
                  disabled={loadingStates[experience._id.toString()]}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-0">
                <p>Remove {experience.job_title || "this experience"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`job-title-${experience._id}`}>Job Title</Label>
              <Input
                id={`job-title-${experience._id}`}
                value={experience.job_title}
                onChange={(e) =>
                  handleInputChange(experience._id, "job_title", e.target.value)
                }
                disabled={loadingStates[experience._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`organization-${experience._id}`}>Organization</Label>
              <Input
                id={`organization-${experience._id}`}
                value={experience.organization}
                onChange={(e) =>
                  handleInputChange(experience._id, "organization", e.target.value)
                }
                disabled={loadingStates[experience._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`start-date-${experience._id}`}>Start Date</Label>
              <Input
                id={`start-date-${experience._id}`}
                value={experience.start_date}
                onChange={(e) =>
                  handleInputChange(experience._id, "start_date", e.target.value)
                }
                placeholder="eg. 7/2024 or July 2024"
                disabled={loadingStates[experience._id.toString()]}
              />
            </div>
            <div>
              <Label htmlFor={`end-date-${experience._id}`}>End Date</Label>
              <Input
                id={`end-date-${experience._id}`}
                value={experience.end_date}
                onChange={(e) =>
                  handleInputChange(experience._id, "end_date", e.target.value)
                }
                placeholder="eg. 7/2024, July 2024, or Present"
                disabled={loadingStates[experience._id.toString()]}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`responsibilities-${experience._id}`}>
              Responsibilities
            </Label>
            <Textarea
              id={`responsibilities-${experience._id}`}
              value={experience.responsibilities}
              onChange={(e) =>
                handleInputChange(experience._id, "responsibilities", e.target.value)
              }
              disabled={loadingStates[experience._id.toString()]}
            />
          </div>
          <Button
            onClick={() => handleSave(experience)}
            disabled={loadingStates[experience._id.toString()]}
          >
            {loadingStates[experience._id.toString()] ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      ))}
      <Button onClick={addNewExperience}>
        <Plus className="h-4 w-4 mr-2" /> Add New Experience
      </Button>
    </div>
  );
}