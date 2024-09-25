import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { states } from "@/lib/data/form-value-states";
import { useUser } from "@clerk/nextjs";
import { addCandidateEntryManually } from "@/lib/candidate/manual-resume-upload/add-manual-user-entry";
import { saveResumeData } from "@/lib/candidate/manual-resume-upload/add-static-entry";
import {
  FormValues,
  formSchema,
} from "@/lib/candidate/manual-resume-upload/schema";
import { startManualResumeProcess } from "@/lib/candidate/manual-resume-upload/manual-process-helper";
import { ProcessAlertDialog } from "@/app/(auth)/dashboard/views/candidate/main-post-manual-processing";

interface CreateResumeFormProps {
  onBack: () => void;
}

export function CreateResumeForm({ onBack }: CreateResumeFormProps) {
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const cuid = user?.publicMetadata?.aiq_cuid as string | undefined;

  const [step, setStep] = useState(1);
  const steps = ["Info", "Location", "Education", "Certifications", "Work"];
  const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;
  const [formattedPhone, setFormattedPhone] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      company: "",
      phone: "",
      email: userEmail,
      education: [
        { institution: "", degree: "", start_date: "", end_date: "" },
      ],
      location: { city: "", state: "", zipcode: "" },
      clearance_level: "none",
      professional_certifications: [
        {
          name: "",
          issuing_organization: "",
          date_obtained: "",
          expiration_date: "",
          credential_id: "",
        },
      ],
      work_experience: [
        {
          organization: "",
          job_title: "",
          responsibilities: "",
          start_date: "",
          end_date: "",
        },
      ],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "professional_certifications",
  });

  const {
    fields: workExperienceFields,
    append: appendWorkExperience,
    remove: removeWorkExperience,
  } = useFieldArray({
    control: form.control,
    name: "work_experience",
  });

  const handleFormSubmit = async () => {
    const formData = form.getValues();

    if (form.formState.isValid) {
      if (cuid && userEmail) {
        // First, add the candidate entry manually
        const addCandidateResult = await addCandidateEntryManually(
          userEmail,
          cuid,
          formData.name
        );

        if (addCandidateResult.success) {
          // If the candidate entry was added successfully, proceed with saving resume data
          const result = await saveResumeData(formData, cuid);
          if (result.success) {
            const { runId } = await startManualResumeProcess(cuid);
            setRunId(runId[0]);
            setShowAlert(true);
          } else {
            console.error("Error saving resume data");
            // Display toast error instead
          }
        } else {
          console.error("Error adding candidate entry");
          // Display toast error for candidate entry failure
        }
      } else {
        console.error("Missing user email or cuid");
        // Display toast error for missing user information
      }
    } else {
      // Handle invalid form (e.g., show validation errors to the user)
    }
  };

  const handleProcessComplete = () => {
    //setShowAlert(false);
    // Toast
  };

  const nextStep = async () => {
    if (step < 5) {
      let isValid = false;
      switch (step) {
        case 1:
          isValid = await form.trigger(["name", "title", "phone"]);
          break;
        case 2:
          isValid = await form.trigger([
            "location.city",
            "location.state",
            "location.zipcode",
          ]);
          break;
        case 3:
          isValid = await form.trigger("education");
          break;
        case 4:
          isValid = await form.trigger("professional_certifications");
          break;
        default:
          isValid = true;
      }

      if (isValid) {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    const match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl p-6 bg-white mx-auto"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-bold mb-6 text-gray-800">
          Create Your Resume
        </h2>
        <div className="mb-4">
          <ol className="flex items-center w-full">
            {steps.map((stepName, index) => (
              <li
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? "w-full" : ""
                }`}
              >
                <div className="flex flex-col items-center">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                      step === index + 1
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-indigo-600"
                        : step > index + 1
                        ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-indigo-500"
                        : "bg-white text-gray-400 border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </motion.span>
                  <span
                    className={`mt-1 text-xs font-medium ${
                      step === index + 1
                        ? "text-indigo-600"
                        : step > index + 1
                        ? "text-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-full mx-1">
                    <div
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        step > index + 1
                          ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1 mb-4 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full"
          ></motion.div>
        </div>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Most Recent Role Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Software Engineer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Company (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Inc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(123) 456-7890"
                          value={formattedPhone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setFormattedPhone(formatted);
                            field.onChange(e.target.value.replace(/\D/g, ""));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={userEmail}
                          defaultValue={userEmail}
                          disabled={true}
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clearance_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clearance Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clearance level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="basic">Public Trust</SelectItem>
                          <SelectItem value="confidential">Secret</SelectItem>
                          <SelectItem value="critical">Top Secret</SelectItem>
                          <SelectItem value="paramount">
                            Top Secret/SCI
                          </SelectItem>
                          <SelectItem value="q_clearance">
                            Q Clearance
                          </SelectItem>
                          <SelectItem value="l_clearance">
                            L Clearance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-md font-semibold mb-4">Location</h3>
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="New York" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="12345"
                          required
                          maxLength={5}
                          onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (
                              charCode > 31 &&
                              (charCode < 48 || charCode > 57)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 5);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-md font-semibold mb-4">Education</h3>
                {educationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="University Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Bachelor of Science"
                              required={
                                !!form.watch(`education.${index}.institution`)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.end_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Education
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendEducation({
                      institution: "",
                      degree: "",
                      start_date: "",
                      end_date: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <h3 className="text-md font-semibold mb-4">
                  Professional Certifications
                </h3>
                {certificationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <FormField
                      control={form.control}
                      name={`professional_certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="AWS Certified Solutions Architect"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`professional_certifications.${index}.issuing_organization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Organization</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Amazon Web Services"
                              required={
                                !!form.watch(
                                  `professional_certifications.${index}.name`
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`professional_certifications.${index}.date_obtained`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Obtained</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`professional_certifications.${index}.expiration_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`professional_certifications.${index}.credential_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credential ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ABC-123-XYZ" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Certification
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendCertification({
                      name: "",
                      issuing_organization: "",
                      date_obtained: "",
                      expiration_date: "",
                      credential_id: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certification
                </Button>
              </>
            )}

            {step === 5 && (
              <>
                <h3 className="text-md font-semibold mb-4">Work Experience</h3>
                {workExperienceFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.organization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Company Name"
                              required={
                                !!form.watch(
                                  `work_experience.${index}.job_title`
                                ) ||
                                !!form.watch(
                                  `work_experience.${index}.organization`
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.job_title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Software Engineer"
                              required={
                                !!form.watch(
                                  `work_experience.${index}.organization`
                                ) ||
                                !!form.watch(
                                  `work_experience.${index}.job_title`
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.responsibilities`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsibilities</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe your key responsibilities and achievements"
                              required={
                                !!form.watch(
                                  `work_experience.${index}.organization`
                                ) ||
                                !!form.watch(
                                  `work_experience.${index}.job_title`
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work_experience.${index}.end_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeWorkExperience(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Work Experience
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendWorkExperience({
                      organization: "",
                      job_title: "",
                      responsibilities: "",
                      start_date: "",
                      end_date: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Work Experience
                </Button>
              </>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="py-3 px-6 text-base font-semibold rounded-xl shadow-md transition-all duration-200 ease-in-out border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="py-3 px-6 text-base font-semibold rounded-xl shadow-md transition-all duration-200 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={showAlert && !!runId}
                      className="py-3 px-6 text-base font-semibold rounded-xl shadow-md transition-all duration-200 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      variant="default"
                    >
                      I'm Ready
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit your resume? Please
                        confirm that all information is correct.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                        Cancel
                      </AlertDialogCancel>

                      <AlertDialogAction
                        onClick={handleFormSubmit}
                        className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-colors duration-200"
                      >
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </Form>
      </motion.div>
      {showAlert && runId && (
        <ProcessAlertDialog runId={runId} onComplete={handleProcessComplete} />
      )}
    </div>
  );
}
