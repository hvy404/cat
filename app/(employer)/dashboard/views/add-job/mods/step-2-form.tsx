import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useStore from "@/app/state/useStore";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddJDGetDataPoints } from "@/lib/dashboard/ingest-jd/get-data-points";

const jobDetailsSchema = z.object({
  jobTitle: z.string().min(4), // Required
  minSalary: z.number().int().min(0).optional(), // Optional
  maxSalary: z.number().int().min(0).optional(), // Optional
  locationType: z.enum(["remote", "onsite", "hybrid"]).optional(), // Required
  privateEmployer: z.boolean().optional(), // Optional
  securityClearance: z
    .enum(["none", "basic", "secret", "top-secret"])
    .optional(), // Optional
  pocName: z.string().min(2).optional(), // Optional
  pocEmail: z.string().email().optional(), // Optional
});

export default function AddJDStep2Form() {
  const { addJD, setAddJD, user } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
    user: state.user,
  }));

  // Initilaize the form
  const form = useForm<z.infer<typeof jobDetailsSchema>>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: {
      jobTitle: "",
      minSalary: undefined,
      maxSalary: undefined,
      locationType: undefined,
      privateEmployer: false,
      securityClearance: undefined,
    },
  });

  // TODO: Fix the double fetch issue
  // TODO: Remove the hardcoded UUIDs
  useEffect(() => {
    console.log("useEffect triggered with user UUID:", user?.uuid);
    let isMounted = true;

    if (!user || !user.uuid) {
      //console.log("User or user UUID not set yet.");
      return;
    }

    async function fetchJobDetails() {
      //console.log("Fetching job details");
      const result = await AddJDGetDataPoints(
        "db5aeeb9-c7c4-485d-bbb1-a1d7d64b04d5",
        "f5246ce0-da92-4916-b1c8-dedf415a8dd2"
      );

      //console.log("Data fetched:", result);

      if (result && isMounted) {
        const jdTopLevelDetails = result.jd_data[0];

        // Set the job details in the store
        setAddJD({
          jobDetails: [
            {
              title: jdTopLevelDetails.title,
              location_type: jdTopLevelDetails.location_type,
              min_salary: parseInt(jdTopLevelDetails.min_salary, 10),
              max_salary: parseInt(jdTopLevelDetails.max_salary, 10),
              security_clearance: jdTopLevelDetails.security_clearance,
            },
          ],
        });
      }
    }

    fetchJobDetails();

    return () => {
      isMounted = false;
      console.log("Component unmounting");
    };
  }, [user?.uuid]);

  // Update the form with the job details from the store on changes
  useEffect(() => {
    if (addJD.jobDetails[0]) {
      form.reset({
        jobTitle: addJD.jobDetails[0].title,
        minSalary: addJD.jobDetails[0].min_salary,
        maxSalary: addJD.jobDetails[0].max_salary,
        locationType: addJD.jobDetails[0].location_type as
          | "remote"
          | "onsite"
          | "hybrid"
          | undefined,
        securityClearance: addJD.jobDetails[0].security_clearance as
          | "none"
          | "basic"
          | "secret"
          | "top-secret"
          | undefined,
      });
    }
  }, [form, addJD.jobDetails[0]]);

  // Function to handle form submission by updating the store
  function onSubmit(values: z.infer<typeof jobDetailsSchema>) {
    console.log("Value submited: ", values);
    setAddJD({
      jobDetails: [
        {
          title: values.jobTitle,
          location_type: values.locationType ?? "",
          min_salary: values.minSalary ?? 0,
          max_salary: values.maxSalary ?? 0,
          security_clearance: values.securityClearance ?? "",
        },
      ],
    });
  }

  // Broadcast the active field to panel
  const handleFocus = (fieldName: string) => {
    setAddJD({ activeField: fieldName });
  };

  // Broadcast the unfocus action field to panel
  /*   const handleBlur = () => {
    setAddJD({ activeField: null });
  }; */

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-semibold text-base leading-7 text-gray-900">
          Details
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-gray-700 leading-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description Title</FormLabel>
                  <FormControl>
                    <Input {...field} onFocus={() => handleFocus("jobTitle")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type</FormLabel>
                    <Controller
                      control={form.control}
                      name="locationType"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              onFocus={() => handleFocus("locationType")}
                            >
                              <SelectValue placeholder="Choose the location type of the job." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="onsite">Onsite</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="securityClearance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Clearance</FormLabel>
                    <Controller
                      control={form.control}
                      name="securityClearance"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              onFocus={() => handleFocus("securityClearance")}
                            >
                              <SelectValue placeholder="Choose the security clearance." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="basic">
                              Basic / Public Trust
                            </SelectItem>
                            <SelectItem value="secret">Secret</SelectItem>
                            <SelectItem value="top-secret">
                              Top Secret
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <FormField
                  control={form.control}
                  name="minSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimun Salary</FormLabel>

                      <FormControl>
                        <Controller
                          control={form.control}
                          name="minSalary"
                          render={({ field }) => (
                            <div className="flex items-center gap-2 font-medium">
                              $
                              <Input
                                type="number"
                                value={field.value ?? ""} // Use empty string if value is undefined
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value, 10)
                                  )
                                }
                                onFocus={() => handleFocus("minSalary")}
                              />
                            </div>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="maxSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Salary</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="maxSalary"
                        render={({ field }) => (
                          <div className="flex items-center gap-2 font-medium">
                            $
                            <Input
                              type="number"
                              value={field.value ?? ""} // Use empty string if value is undefined
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : parseInt(e.target.value, 10)
                                )
                              }
                              onFocus={() => handleFocus("maxSalary")}
                            />
                          </div>
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="privateEmployer"
              render={({ field }) => (
                <FormItem>
                  <div
                    className="space-y-0.5"
                    onMouseOver={() => handleFocus("privateEmployer")}
                  >
                    <FormLabel>Incognito</FormLabel>
                    <FormDescription>
                      <p>Redact your company name from the job listing.</p>
                      <p>
                        The candidate will see your company name if you invite
                        them to interview.
                      </p>
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button type="submit">Review</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
