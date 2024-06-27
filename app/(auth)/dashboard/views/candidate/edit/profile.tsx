import React, { useState, useEffect } from "react";
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
  SelectGroup,
} from "@/components/ui/select";
import {
  getTalentNode,
  updateNodeProperty,
  TalentNode,
  NodeWithId,
} from "@/lib/candidate/global/mutation";
import { toast } from "sonner";
import FormattedPhoneInput from "@/app/(auth)/dashboard/views/candidate/helpers/formatPhoneInput";
import {
  TalentPropertiesType,
  CLEARANCE_LEVELS,
} from "@/app/(auth)/dashboard/views/candidate/helpers/profileFormValidation";
import { validateTalentProperties } from "@/app/(auth)/dashboard/views/candidate/helpers/profileFormValidationUtility";

type EditableTalentProperties = Pick<
  TalentNode,
  "city" | "clearance_level" | "zipcode" | "phone" | "name" | "state" | "email"
>;

type TalentPropertiesState = EditableTalentProperties & NodeWithId;

type FormErrors = Partial<Record<keyof TalentPropertiesType, string>>;

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

export default function TalentPropertiesEditor() {
  const { user } = useStore();
  const [talentProperties, setTalentProperties] =
    useState<TalentPropertiesState | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTalentProperties = async () => {
      if (user?.uuid) {
        try {
          const talent = await getTalentNode(user.uuid);
          if (talent) {
            const {
              city,
              clearance_level,
              zipcode,
              phone,
              name,
              state,
              email,
              _id,
              labels,
            } = talent;
            setTalentProperties({
              city,
              clearance_level,
              zipcode,
              phone,
              name,
              state,
              email,
              _id,
              labels,
            });
          }
        } catch (error) {
          console.error("Error fetching talent properties:", error);
          toast.error("Failed to load your information. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTalentProperties();
  }, [user]);

  const handleInputChange = (
    field: keyof EditableTalentProperties,
    value: string
  ) => {
    setTalentProperties((prev) => {
      if (!prev) return null;
      if (field === "clearance_level" && value === "None") {
        return { ...prev, [field]: "" };
      }
      return { ...prev, [field]: value };
    });
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (!talentProperties) return;

    setIsSaving(true);
    try {
      const { isValid, errors } = await validateTalentProperties(
        talentProperties as TalentPropertiesType
      );

      if (!isValid) {
        setFormErrors(errors);
        toast.error("Please correct the errors before saving.");
        return;
      }

      for (const [key, value] of Object.entries(talentProperties)) {
        if (key !== "_id" && key !== "labels") {
          await updateNodeProperty({
            nodeId: talentProperties._id,
            propertyName: key as keyof EditableTalentProperties,
            propertyValue: value,
          });
        }
      }
      toast.success("Your information has been updated successfully!");
    } catch (error) {
      console.error("Error saving talent properties:", error);
      toast.error("Failed to save your information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!talentProperties) {
    return <div>No talent information found.</div>;
  }

  return (
    <div className="space-y-6">

      <div className="rounded-md border p-4 space-y-4 hover:border-2 hover:border-gray-900">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={talentProperties.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={talentProperties.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">
              Phone <span className="text-xs font-normal">(Optional)</span>
            </Label>
            <FormattedPhoneInput
              value={talentProperties.phone || ""}
              onChange={(value) => handleInputChange("phone", value)}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4 hover:border-2 hover:border-gray-900">
        <h3 className="text-lg font-semibold">Location</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={talentProperties.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
            {formErrors.city && (
              <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select
              value={talentProperties.state || ""}
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
              value={talentProperties.zipcode || ""}
              onChange={(e) => handleInputChange("zipcode", e.target.value)}
            />
            {formErrors.zipcode && (
              <p className="text-red-500 text-sm mt-1">{formErrors.zipcode}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4 hover:border-2 hover:border-gray-900">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        <div>
          <Label htmlFor="clearance_level">
            Clearance Level{" "}
            <span className="text-xs font-normal">(Optional)</span>
          </Label>
          <Select
            value={talentProperties.clearance_level || "None"}
            onValueChange={(value) =>
              handleInputChange(
                "clearance_level",
                value === "None" ? "" : value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select clearance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CLEARANCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {formErrors.clearance_level && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.clearance_level}
            </p>
          )}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
