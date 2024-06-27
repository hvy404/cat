import React, { useState, useEffect, useCallback } from "react";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Save, Calendar as CalendarIcon } from "lucide-react";
import {
  getTalentCertifications,
  addCertification,
  removeCertification,
  updateNodeProperty,
  CertificationNode,
  NodeWithId
} from "@/lib/candidate/global/mutation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CertificationWithId = CertificationNode & NodeWithId;

export default function Certifications() {
  const { user } = useStore();
  const [certifications, setCertifications] = useState<CertificationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCertifications = useCallback(async () => {
    if (user?.uuid) {
      try {
        setIsLoading(true);
        const fetchedCertifications = await getTalentCertifications(user.uuid);
        setCertifications(fetchedCertifications);
      } catch (error) {
        console.error("Error fetching certifications:", error);
        toast.error("Failed to load certifications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const handleAddCertification = async () => {
    if (!user?.uuid) return;

    setIsSaving(true);
    try {
      const newCertification = await addCertification(user.uuid, { name: "", date_obtained: "" });
      if (newCertification) {
        setCertifications([...certifications, newCertification]);
        toast.success("New certification added successfully.");
      }
    } catch (error) {
      console.error("Error adding new certification:", error);
      toast.error("Failed to add new certification. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCertification = async (index: number) => {
    const certToRemove = certifications[index];
    if (certToRemove._id && typeof certToRemove._id === 'number') {
      try {
        await removeCertification(certToRemove._id);
        setCertifications(certifications.filter((_, i) => i !== index));
        toast.success("Certification removed successfully.");
      } catch (error) {
        console.error("Error removing certification:", error);
        toast.error("Failed to remove certification. Please try again.");
      }
    } else {
      setCertifications(certifications.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index: number, field: keyof CertificationNode, value: string) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value };
    setCertifications(updatedCertifications);
  };

  const handleDateChange = (index: number, date: Date | undefined) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      date_obtained: date ? format(date, "yyyy-MM-dd") : "",
    };
    setCertifications(updatedCertifications);
  };

  const handleSave = async () => {
    if (!user?.uuid) return;

    setIsSaving(true);
    try {
      for (const cert of certifications) {
        if (cert._id && typeof cert._id === 'number') {
          // Update existing certification
          await updateNodeProperty({
            nodeId: cert._id,
            propertyName: "name",
            propertyValue: cert.name
          });
          await updateNodeProperty({
            nodeId: cert._id,
            propertyName: "date_obtained",
            propertyValue: cert.date_obtained
          });
        }
      }
      toast.success("Certifications saved successfully!");
      await fetchCertifications(); // Refresh the list after saving
    } catch (error) {
      console.error("Error saving certifications:", error);
      toast.error("Failed to save certifications. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading certifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Certifications</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAddCertification} variant="outline" size="icon" disabled={isSaving}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new certification</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {certifications.map((cert, index) => (
        <div key={cert._id} className="space-y-4 p-4 border rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Certification {index + 1}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => handleRemoveCertification(index)} variant="outline" size="icon">
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove certification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`cert-name-${index}`}>Certification Name</Label>
            <Input
              id={`cert-name-${index}`}
              value={cert.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`cert-date-${index}`}>Date Obtained</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={`cert-date-${index}`}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !cert.date_obtained && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {cert.date_obtained ? format(parse(cert.date_obtained, "yyyy-MM-dd", new Date()), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={cert.date_obtained ? parse(cert.date_obtained, "yyyy-MM-dd", new Date()) : undefined}
                  onSelect={(date) => handleDateChange(index, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Save Certifications
          </>
        )}
      </Button>
    </div>
  );
}