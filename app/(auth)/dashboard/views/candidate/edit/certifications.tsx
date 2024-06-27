import React, { useState, useEffect, useCallback } from "react";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Calendar as CalendarIcon } from "lucide-react";
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
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});

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

  const handleAddCertification = () => {
    const newCertification: CertificationWithId = {
      _id: -Date.now(), // Temporary negative ID
      name: "",
      date_obtained: "",
      labels: ["Certification"]
    };
    setCertifications([...certifications, newCertification]);
  };

  const handleRemoveCertification = async (index: number) => {
    const certToRemove = certifications[index];
    if (certToRemove._id && typeof certToRemove._id === 'number') {
      setSavingStates({ ...savingStates, [certToRemove._id]: true });
      try {
        if (certToRemove._id > 0) { // Only remove from Neo4j if it's an existing certification
          await removeCertification(certToRemove._id);
        }
        setCertifications(certifications.filter((_, i) => i !== index));
        toast.success("Certification removed successfully.");
      } catch (error) {
        console.error("Error removing certification:", error);
        toast.error("Failed to remove certification. Please try again.");
      } finally {
        setSavingStates({ ...savingStates, [certToRemove._id]: false });
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

  const handleSaveCertification = async (cert: CertificationWithId, index: number) => {
    if (!user?.uuid) return;

    setSavingStates({ ...savingStates, [cert._id]: true });
    try {
      let savedCert: CertificationWithId;
      if (cert._id <= 0) { // New certification
        const newCert = await addCertification(user.uuid, {
          name: cert.name,
          date_obtained: cert.date_obtained
        });
        if (!newCert) {
          throw new Error("Failed to add new certification");
        }
        savedCert = { ...newCert, labels: ["Certification"] };
        toast.success("New certification added successfully.");
      } else { // Existing certification
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
        savedCert = { ...cert };
        toast.success("Certification updated successfully.");
      }
      const updatedCertifications = [...certifications];
      updatedCertifications[index] = savedCert;
      setCertifications(updatedCertifications);
    } catch (error) {
      console.error("Error saving certification:", error);
      toast.error("Failed to save certification. Please try again.");
    } finally {
      setSavingStates({ ...savingStates, [cert._id]: false });
    }
  };

  if (isLoading) {
    return <div>Loading certifications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Certifications</h2>

      {certifications.map((cert, index) => (
        <div key={cert._id} className="space-y-4 p-4 border rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{cert.name || "New Certification"}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => handleRemoveCertification(index)} variant="outline" size="icon" disabled={savingStates[cert._id]}>
                    <Trash2 className="h-4 w-4" />
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
              disabled={savingStates[cert._id]}
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
                  disabled={savingStates[cert._id]}
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
          <Button onClick={() => handleSaveCertification(cert, index)} disabled={savingStates[cert._id]}>
            {savingStates[cert._id] ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Certification
              </>
            )}
          </Button>
        </div>
      ))}

      <Button onClick={handleAddCertification} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add New Certification
      </Button>
    </div>
  );
}