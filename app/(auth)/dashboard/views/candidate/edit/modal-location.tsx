import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTalentNode,
  updateNodeProperty,
  TalentNode,
  NodeWithId,
} from "@/lib/candidate/global/mutation";
import { toast } from "sonner";

type LocationProperties = Pick<TalentNode, "city" | "state" | "zipcode">;
type LocationState = LocationProperties & NodeWithId;
type FormErrors = Partial<Record<keyof LocationProperties, string>>;

const US_STATES = [
  { abbreviation: "AL", name: "Alabama" },
  { abbreviation: "AK", name: "Alaska" },
  { abbreviation: "AZ", name: "Arizona" },
  { abbreviation: "AR", name: "Arkansas" },
  { abbreviation: "CA", name: "California" },
  { abbreviation: "CO", name: "Colorado" },
  { abbreviation: "CT", name: "Connecticut" },
  { abbreviation: "DE", name: "Delaware" },
  { abbreviation: "FL", name: "Florida" },
  { abbreviation: "GA", name: "Georgia" },
  { abbreviation: "HI", name: "Hawaii" },
  { abbreviation: "ID", name: "Idaho" },
  { abbreviation: "IL", name: "Illinois" },
  { abbreviation: "IN", name: "Indiana" },
  { abbreviation: "IA", name: "Iowa" },
  { abbreviation: "KS", name: "Kansas" },
  { abbreviation: "KY", name: "Kentucky" },
  { abbreviation: "LA", name: "Louisiana" },
  { abbreviation: "ME", name: "Maine" },
  { abbreviation: "MD", name: "Maryland" },
  { abbreviation: "MA", name: "Massachusetts" },
  { abbreviation: "MI", name: "Michigan" },
  { abbreviation: "MN", name: "Minnesota" },
  { abbreviation: "MS", name: "Mississippi" },
  { abbreviation: "MO", name: "Missouri" },
  { abbreviation: "MT", name: "Montana" },
  { abbreviation: "NE", name: "Nebraska" },
  { abbreviation: "NV", name: "Nevada" },
  { abbreviation: "NH", name: "New Hampshire" },
  { abbreviation: "NJ", name: "New Jersey" },
  { abbreviation: "NM", name: "New Mexico" },
  { abbreviation: "NY", name: "New York" },
  { abbreviation: "NC", name: "North Carolina" },
  { abbreviation: "ND", name: "North Dakota" },
  { abbreviation: "OH", name: "Ohio" },
  { abbreviation: "OK", name: "Oklahoma" },
  { abbreviation: "OR", name: "Oregon" },
  { abbreviation: "PA", name: "Pennsylvania" },
  { abbreviation: "RI", name: "Rhode Island" },
  { abbreviation: "SC", name: "South Carolina" },
  { abbreviation: "SD", name: "South Dakota" },
  { abbreviation: "TN", name: "Tennessee" },
  { abbreviation: "TX", name: "Texas" },
  { abbreviation: "UT", name: "Utah" },
  { abbreviation: "VT", name: "Vermont" },
  { abbreviation: "VA", name: "Virginia" },
  { abbreviation: "WA", name: "Washington" },
  { abbreviation: "WV", name: "West Virginia" },
  { abbreviation: "WI", name: "Wisconsin" },
  { abbreviation: "WY", name: "Wyoming" },
];

export default function LocationEditor() {
  const { user: clerkUser } = useUser();
  const [locationProperties, setLocationProperties] =
    useState<LocationState | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const candidateId = clerkUser?.publicMetadata?.cuid as string;

  useEffect(() => {
    const fetchLocationProperties = async () => {
      if (candidateId) {
        try {
          const talent = await getTalentNode(candidateId);
          if (talent) {
            const { city, state, zipcode, _id, labels } = talent;
            setLocationProperties({ city, state, zipcode, _id, labels });
          }
        } catch (error) {
          console.error("Error fetching location properties:", error);
          toast.error(
            "Failed to load your location information. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLocationProperties();
  }, [candidateId]);

  const handleInputChange = (
    field: keyof LocationProperties,
    value: string
  ) => {
    setLocationProperties((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (!locationProperties) return;

    const errors: FormErrors = {};
    if (!locationProperties.city) errors.city = "City is required.";
    if (!locationProperties.state) errors.state = "State is required.";
    if (!locationProperties.zipcode) errors.zipcode = "Zip Code is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(locationProperties)) {
        if (key !== "_id" && key !== "labels") {
          await updateNodeProperty({
            nodeId: locationProperties._id,
            propertyName: key as keyof LocationProperties,
            propertyValue: value || "",
          });
        }
      }
      toast.success("Your location has been updated successfully!");
    } catch (error) {
      console.error("Error saving location properties:", error);
      toast.error("Failed to save your location. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!locationProperties) {
    return <div>No location information found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4 space-y-4 hover:border-2 hover:border-gray-900">
        <h3 className="text-lg font-semibold">Location</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={locationProperties.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
            {formErrors.city && (
              <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select
              value={locationProperties.state || ""}
              onValueChange={(value) => handleInputChange("state", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem
                    key={state.abbreviation}
                    value={state.abbreviation}
                  >
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.state && (
              <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zipcode">Zip Code</Label>
            <Input
              id="zipcode"
              value={locationProperties.zipcode || ""}
              onChange={(e) => handleInputChange("zipcode", e.target.value)}
            />
            {formErrors.zipcode && (
              <p className="text-red-500 text-sm mt-1">{formErrors.zipcode}</p>
            )}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Update Location
          </>
        )}
      </Button>
    </div>
  );
}
