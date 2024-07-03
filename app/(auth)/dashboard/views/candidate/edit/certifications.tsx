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

  const handleDateChange = (index: number, field: "date_obtained" | "expiration_date", date: Date | undefined) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: date ? format(date, "yyyy-MM-dd") : "",
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
          date_obtained: cert.date_obtained,
          issuing_organization: cert.issuing_organization,
          expiration_date: cert.expiration_date,
          credential_id: cert.credential_id,
          credential_url: cert.credential_url
        });
        if (!newCert) {
          throw new Error("Failed to add new certification");
        }
        savedCert = { ...newCert, labels: ["Certification"] };
        toast.success("New certification added successfully.");
      } else { // Existing certification
        for (const [key, value] of Object.entries(cert)) {
          if (key !== "_id" && key !== "labels") {
            await updateNodeProperty({
              nodeId: cert._id,
              propertyName: key as keyof CertificationNode,
              propertyValue: value
            });
          }
        }
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

  const DateInput = ({ index, field, label, value }: { index: number, field: "date_obtained" | "expiration_date", label: string, value?: string }) => (
    <div className="space-y-2 w-full">
      <Label htmlFor={`cert-${field}-${index}`}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={`cert-${field}-${index}`}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={savingStates[certifications[index]._id]}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(parse(value, "yyyy-MM-dd", new Date()), "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value ? parse(value, "yyyy-MM-dd", new Date()) : undefined}
            onSelect={(date) => handleDateChange(index, field, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="space-y-6">
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
                <TooltipContent className="bg-black border-0 text-white">
                  <p>Remove {cert.name || "this certification"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`cert-name-${index}`}>Certification Name*</Label>
            <Input
              id={`cert-name-${index}`}
              value={cert.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
              disabled={savingStates[cert._id]}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`cert-org-${index}`}>Issuing Organization</Label>
              <Input
                id={`cert-org-${index}`}
                value={cert.issuing_organization || ""}
                onChange={(e) => handleInputChange(index, "issuing_organization", e.target.value)}
                disabled={savingStates[cert._id]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cert-id-${index}`}>Credential ID</Label>
              <Input
                id={`cert-id-${index}`}
                value={cert.credential_id || ""}
                onChange={(e) => handleInputChange(index, "credential_id", e.target.value)}
                disabled={savingStates[cert._id]}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput index={index} field="date_obtained" label="Date Obtained" value={cert.date_obtained} />
            <DateInput index={index} field="expiration_date" label="Expiration Date" value={cert.expiration_date} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`cert-url-${index}`}>Credential URL</Label>
            <Input
              id={`cert-url-${index}`}
              value={cert.credential_url || ""}
              onChange={(e) => handleInputChange(index, "credential_url", e.target.value)}
              disabled={savingStates[cert._id]}
              type="url"
            />
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