"use client";
import { useEffect, useState, useMemo } from "react";
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
import { SaveJobDetails } from "@/lib/dashboard/ingest-jd/save-data-points";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const jobDetailsSchema = z
  .object({
    jobTitle: z
      .string()
      .min(5, "The job title must consist of at least five characters."),
    minSalary: z.number().int().min(0).optional(),
    maxSalary: z.number().int().min(0).optional(),
    locationType: z
      .union([z.enum(["remote", "onsite", "hybrid"]), z.literal("")])
      .refine((val) => val !== "", {
        message: "Please select a valid location type.",
      }),
    privateEmployer: z.boolean().optional(),
    salaryOte: z.number().int().min(0, "OTE must be at least 0").optional(),
    commissionPercent: z
      .number()
      .int()
      .min(0)
      .transform((value) => (isNaN(value) ? undefined : value))
      .optional(),
    clearanceLevel: z
      .union([z.enum(["none", "basic", "elevated", "high"]), z.literal("")])
      .refine((val) => val !== "", {
        message: "Please select a clearance type.",
      }),
    pocName: z.string().min(2).optional(),
    pocEmail: z.string().email().optional(),
    discloseSalary: z.boolean().optional(),
    commissionPay: z.boolean().optional(),
    baseCommissionRatio: z.string().optional(),
    basePercent: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.commissionPay) {
        return data.salaryOte !== null && data.salaryOte !== undefined;
      } else {
        return data.minSalary !== undefined && data.maxSalary !== undefined;
      }
    },
    {
      message:
        "On-target earnings (OTE) must be specified if commission pay is selected.",
      path: ["salaryOte"],
    }
  )
  .superRefine((data, ctx) => {
    if (!data.commissionPay) {
      if (data.minSalary === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a minimum salary",
          path: ["minSalary"],
        });
      }
      if (data.maxSalary === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a maximum salary",
          path: ["maxSalary"],
        });
      }
    }
  });

export default function AddJDStep2Form() {
  const { addJD, setAddJD, user, setSelectedMenuItem } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
    user: state.user,
    setSelectedMenuItem: state.setSelectedMenuItem,
  }));

  // Initilaize the form
  const form = useForm<z.infer<typeof jobDetailsSchema>>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: {
      jobTitle: "",
      minSalary: undefined,
      maxSalary: undefined,
      commissionPercent: undefined,
      salaryOte: undefined,
      locationType: undefined,
      privateEmployer: false,
      clearanceLevel: undefined,
      discloseSalary: undefined,
      commissionPay: false,
      baseCommissionRatio: undefined,
      basePercent: 50, // Defaulting to 50% if nothing is specified
    },
  });

  // Watch for change in form toggles
  const discloseSalary = form.watch("discloseSalary");
  const commissionPay = form.watch("commissionPay");

  // States to manage background color transitions
  const [commissionPercentColor, setCommissionPercentColor] =
    useState("transparent");
  const [maxSalaryColor, setMaxSalaryColor] = useState("transparent");

  useEffect(() => {
    if (commissionPay) {
      setCommissionPercentColor(
        "bg-yellow-50 transition-colors duration-200 p-2 rounded-lg"
      ); // Change color to light blue
      setTimeout(
        () =>
          setCommissionPercentColor(
            "transparent transition-colors duration-200"
          ),
        2000
      ); // Reset after 2 seconds
    } else {
      setMaxSalaryColor(
        "bg-yellow-50 transition-colors duration-200 p-2 rounded-lg"
      );
      setTimeout(
        () => setMaxSalaryColor("transparent transition-colors duration-200"),
        2000
      );
    }
  }, [commissionPay]); // Only re-run the effect if commissionPay changes

  // TODO: Remove the hardcoded UUIDs
  useEffect(() => {
    let isMounted = true;

    if (!user || !user.uuid || !addJD || !addJD.jdEntryID) {
      //console.log("User or user UUID not set yet.");
      return;
    }

    async function fetchJobDetails() {
      if (!addJD || !addJD.jdEntryID) {
        console.error("Job Description ID not found");
        return;
      }
      // TODO - Remove hardcoded UUIDs
      const result = await AddJDGetDataPoints(
        addJD.jdEntryID,
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
              salary_ote: parseInt(jdTopLevelDetails.ote_salary, 10),
              commission_percent: parseFloat(
                jdTopLevelDetails.commission_percent
              ),
              security_clearance: jdTopLevelDetails.security_clearance,
              salary_disclose: jdTopLevelDetails.salary_disclose,
              commission_pay: jdTopLevelDetails.commission_pay,
            },
          ],
        });
      }
    }

    fetchJobDetails();

    return () => {
      isMounted = false;
      //console.log("Component unmounting");
    };
  }, [user?.uuid]);

  // Update the form with the job details from the store on changes
  useEffect(() => {
    if (addJD.jobDetails[0]) {
      form.reset({
        jobTitle: addJD.jobDetails[0].title,
        minSalary: addJD.jobDetails[0].min_salary || undefined,
        maxSalary: addJD.jobDetails[0].max_salary || undefined,
        locationType: addJD.jobDetails[0].location_type as
          | "remote"
          | "onsite"
          | "hybrid"
          | undefined,
        clearanceLevel: addJD.jobDetails[0].security_clearance as
          | "none"
          | "basic"
          | "elevated"
          | "high"
          | undefined,
        discloseSalary: addJD.jobDetails[0].salary_disclose,
        commissionPay: addJD.jobDetails[0].commission_pay,
        commissionPercent: addJD.jobDetails[0].commission_percent,
        salaryOte: addJD.jobDetails[0].salary_ote || undefined,
      });
    }
  }, [form, addJD.jobDetails[0]]);

  // Function to handle form submission by updating the store
  const onSubmit = (
    values: z.infer<typeof jobDetailsSchema>,
    event?: React.BaseSyntheticEvent
  ) => {
    //event?.preventDefault();
    console.log("Value submitted: ", values);

    const jdUUID = addJD.jdEntryID; // Ensure this is the correct UUID from your state

    const normalizedValues = {
      ...values,
      locationType: values.locationType || undefined, // Replace empty string with undefined, if empty
      clearanceLevel: values.clearanceLevel || undefined,
    };

    // check for jdUUID is not empty
    if (!jdUUID) {
      console.error("Job Description UUID is empty.");
      return;
    }

    SaveJobDetails(normalizedValues, jdUUID)
      .then((response) => {
        if (response.error) {
          console.error("Failed to update job details:", response.error);
        } else if (response.success) {
          // Check if the success property is true
          console.log("Job details updated successfully!");
          // TODO: add switch to next step
          setAddJD({ step: 3 });
        } else {
          console.log("Job details update was not successful");
        }
      })
      .catch((error) => {
        console.error("Error in saving job details:", error);
      });

    /* setAddJD({
      jobDetails: [
        {
          title: values.jobTitle,
          location_type: values.locationType ?? "",
          min_salary: values.minSalary ?? 0,
          max_salary: values.maxSalary ?? 0,
          security_clearance: values.clearanceLevel ?? "",
          salary_disclose: values.discloseSalary ?? false,
          commission_pay: values.commissionPay ?? false,
          commission_percent: values.commissionPercent ?? 0,
        },
      ],
    }); */
  };

  // Broadcast the active field to panel
  const handleFocus = (fieldName: string) => {
    setAddJD({ activeField: fieldName });
  };

  // Updated useMemo hook to prepare data for the chart
  const oteChartData = useMemo(() => {
    if (!commissionPay) return null;

    const ote = form.getValues("salaryOte") || 0;
    const commissionPercent = form.getValues("commissionPercent") || 0;
    const commission = (ote * commissionPercent) / 100;
    const baseSalary = ote - commission;

    return [
      {
        name: "OTE Split",
        baseSalary,
        commission,
        total: ote,
      },
    ];
  }, [form.watch("salaryOte"), form.watch("commissionPercent"), commissionPay]);

  const tooltipFormatter = (
    value: number | string,
    name: string
  ): [string | null, string | null] => {
    if (value === 0 || value === undefined) {
      return [null, null];
    }

    if (name === "baseSalary") {
      return [`$${value.toLocaleString()}`, "Base"];
    } else if (name === "commission") {
      return [`$${value.toLocaleString()}`, "Commission"];
    }
    return [value.toString(), name];
  };

  // Function to render bar chart
  const renderBarChart = () => {
    if (!oteChartData) return null;

    return (
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={oteChartData} layout="vertical">
          <XAxis type="number" hide={true} />
          <YAxis type="category" dataKey="name" hide={true} />
          <Tooltip cursor={false} formatter={tooltipFormatter} />
          <Bar
            dataKey="baseSalary"
            fill="#35404e"
            stackId="a"
            barSize={40}
            radius={[10, 0, 0, 10]}
          >
            <LabelList
              dataKey="baseSalary"
              position="insideLeft"
              style={{ fill: "#fff" }}
              formatter={(value: number) => `$${value.toLocaleString()} Base`}
            />
          </Bar>
          <Bar
            dataKey="commission"
            fill="#657994"
            stackId="a"
            barSize={40}
            radius={[0, 10, 10, 0]}
          >
            <LabelList
              dataKey="commission"
              position="insideRight"
              style={{ fill: "#fff" }}
              formatter={(value: number) =>
                `$${value.toLocaleString()} Commission`
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

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
                name="clearanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Clearance</FormLabel>
                    <Controller
                      control={form.control}
                      name="clearanceLevel"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              onFocus={() => handleFocus("clearanceLevel")}
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
              {!commissionPay && (
                <FormField
                  control={form.control}
                  name="minSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Salary</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="minSalary"
                          render={({ field }) => (
                            <div className="flex items-center gap-2 font-medium">
                              $
                              <Input
                                disabled={!discloseSalary}
                                type="text"
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? null : parseInt(value, 10)
                                  );
                                }}
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
              )}

              {/* Hide field if commission */}
              {!commissionPay && (
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
                                disabled={!discloseSalary}
                                type="text"
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? null : parseInt(value, 10)
                                  );
                                }}
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
              )}

              {/* OTE Salary */}
              {commissionPay && (
                <FormField
                  control={form.control}
                  name="salaryOte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTE (On-target Earnings)</FormLabel>
                      <div className="flex flex-row items-center gap-2">
                        ${" "}
                        <FormControl>
                          <Input
                            disabled={!discloseSalary}
                            type="text"
                            value={
                              field.value === null || field.value === undefined
                                ? ""
                                : field.value.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value, 10)
                              );
                            }}
                            onFocus={() => handleFocus("salaryOte")}
                          />
                        </FormControl>{" "}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Hide if non-commision */}
              {commissionPay && (
                <>
                  <FormField
                    control={form.control}
                    name="commissionPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Rate</FormLabel>
                        <div className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Input
                              type="text"
                              value={
                                field.value === undefined ? "" : field.value
                              } // Ensure the value is a string
                              onFocus={() => handleFocus("commissionPercent")}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Handle the field update based on the input value
                                if (value === "") {
                                  field.onChange(undefined); // Allow empty value
                                } else {
                                  const numValue = parseFloat(value);
                                  // Update only if the value is a number
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue);
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          %
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-row w-full">{renderBarChart()}</div>
                </>
              )}

              {/* End Hide if non-commision */}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="privateEmployer"
                render={({ field }) => (
                  <FormItem className="bg-muted/30 p-4">
                    <div
                      className="space-y-0.5"
                      onMouseOver={() => handleFocus("privateEmployer")}
                    >
                      <FormLabel>Stealth Hiring</FormLabel>
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

              <FormField
                control={form.control}
                name="discloseSalary"
                render={({ field }) => (
                  <FormItem className="bg-muted/30 p-4">
                    <div
                      className="space-y-0.5"
                      onMouseOver={() => handleFocus("discloseSalary")}
                    >
                      <FormLabel>Show Compensation</FormLabel>
                      <FormDescription>
                        <p>Show the salary range on the job listing.</p>
                        <p>
                          This choice does not affect the matching algorithm.
                        </p>
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Switch
                          id="discloseSalary"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Separator
                          orientation="vertical"
                          className="h-4 text-gray-800"
                        />
                        <Controller
                          name="commissionPay"
                          control={form.control}
                          render={({ field: { value, onChange } }) => (
                            <Label className="flex flex-row items-center justify-start">
                              <Checkbox
                                checked={value}
                                onCheckedChange={onChange}
                                disabled={!form.watch("discloseSalary")}
                              />
                              <span className="ml-2 text-muted-foreground font-light">
                                Commission Split
                              </span>
                            </Label>
                          )}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row justify-end">
              <Button type="submit">Post</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
