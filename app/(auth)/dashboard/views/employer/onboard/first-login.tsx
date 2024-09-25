import useStore from "@/app/state/useStore";
import React, { useState } from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { setOnboardingStatusComplete } from "@/lib/employer/check-user-onboard-status"; // Update in DB
import { updateEmployerInitClerk } from "@/lib/employer/set-clerk-onboarded-status"; // Update in user metadata
import { updateEmployerName } from "@/lib/employer/onboard-add-name";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";


const nameSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or less")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "First name can only contain letters, spaces, and hyphens"
    ),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be 50 characters or less")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "Last name can only contain letters, spaces, and hyphens"
    ),
});

type NameSchemaType = z.infer<typeof nameSchema>;

export const InitialUserOnboard: React.FC = ({}) => {
    const { setEmployerOnboardingStatus } = useStore();
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;
  const [formData, setFormData] = useState<NameSchemaType>({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<Partial<NameSchemaType>>({});
  const [showDialog, setShowDialog] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = { ...formData, [e.target.id]: e.target.value };
    setFormData(newFormData);

    const validationResult = nameSchema.safeParse(newFormData);
    setIsFormValid(validationResult.success);
  };

  const onboardingComplete = async (firstName: string, lastName: string) => {
    if (cuid) {
      try {
        const nameUpdateResult = await updateEmployerName(cuid, firstName, lastName);
        if (!nameUpdateResult.success) {
          throw new Error("Failed to update employer name");
        }
  
        await updateEmployerInitClerk();
  
        const result = await setOnboardingStatusComplete(cuid);
        if (!result) {
          throw new Error("Failed to set onboarding status to complete");
        }
  
        // Update the Zustand store
        setEmployerOnboardingStatus(true);
  
        // Close the dialog
        setShowDialog(false);
  
      } catch (error) {
        toast.error(
          "There was an error completing onboarding. Please try again."
        );
      }
    } else {
      toast.error("User not found");
    }
  };  
  

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const validatedData = nameSchema.parse(formData);
      await onboardingComplete(validatedData.firstName, validatedData.lastName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full rounded-md bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center p-4">
        <h2 className="text-md font-medium text-gray-800 mb-6 text-center">
          You're almost ready, we just need a few more details.
        </h2>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-2xl border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              Welcome to Your Dashboard
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-gray-600">
              <p className="mb-4">
                To tailor your experience and optimize our service for your
                needs, we kindly request your name.
              </p>
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName[0]}
                    </p>
                  )}
                </div>
              </div>
              <p className="flex items-center text-sm text-gray-600 mt-4">
                <User className="w-4 h-4 mr-2 text-indigo-500" />
                <span>
                  Your information helps us provide a personalized experience.
                </span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3 mt-6">
            <AlertDialogAction
              onClick={handleSubmit}
              className={`px-6 py-2 text-white rounded-md transition-colors duration-200 shadow-md ${
                isFormValid && !isLoading
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InitialUserOnboard;
