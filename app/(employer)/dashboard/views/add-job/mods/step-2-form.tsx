import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddJDGetDataPoints } from "@/lib/dashboard/ingest-jd/get-data-points";
import { SaveJobDetails } from "@/lib/dashboard/ingest-jd/save-data-points";
import { z } from "zod";

interface ValidationErrors {
  [key: string]: string;
}

const schema = z
  .object({
    jobTitle: z.string().min(1, "Job title is required"),
    location_type: z.string().min(1, "Location type is required"),
    security_clearance: z.string().min(1, "Clearance is required"),
    salary_disclose: z.boolean(),
    compensation_type: z.string(),
    min_salary: z.number().optional().nullable(),
    max_salary: z.number().optional().nullable(),
    hourly_comp_min: z.number().optional().nullable(),
    hourly_comp_max: z.number().optional().nullable(),
    ote_salary: z.number().optional().nullable(),
commission_percent: z.number().max(99).refine(value => value <= 99, {
  message: "Commission percent cannot be more than 99%",
}).optional().nullable(),  })
  .refine(
    (data) =>
      !data.salary_disclose ||
      (data.compensation_type === "salary" &&
        data.min_salary !== null &&
        data.max_salary !== null) ||
      (data.compensation_type === "hourly" &&
        data.hourly_comp_min !== null &&
        data.hourly_comp_max !== null) ||
      (data.compensation_type === "commission" &&
        data.ote_salary !== null &&
        data.commission_percent !== null),
    {
      message:
        "Please provide the required salary information based on the selected compensation type",
      path: ["compensation"],
    }
  );

export default function AddJDStep2Form() {
  const { addJD, setAddJD, user } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
    user: state.user,
  }));

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    jobTitle: "",
    location_type: "",
    security_clearance: "",
    compensation: "",
    commission_percent: "",
    // Add other fields as needed
  });

  useEffect(() => {
    let isMounted = true;

    if (!user || !user.uuid || !addJD || !addJD.jdEntryID) {
      console.log("User or user UUID not set yet.");
      return;
    }

    async function fetchJobDetails() {
      if (!addJD || !addJD.jdEntryID) {
        console.error("Job Description ID not found");
        return;
      }

      const result = await AddJDGetDataPoints(
        addJD.jdEntryID,
        "f5246ce0-da92-4916-b1c8-dedf415a8dd2" // TODO: Remove hardcoded employer ID
      );

      console.log("Data fetched:", result);

      if (result && isMounted) {
        const jdTopLevelDetails = result.jd_data[0];

        setAddJD({
          jobDetails: [
            {
              jobTitle: jdTopLevelDetails.title,
              location_type: jdTopLevelDetails.location_type,
              min_salary: parseInt(jdTopLevelDetails.min_salary, 10),
              max_salary: parseInt(jdTopLevelDetails.max_salary, 10),
              ote_salary: jdTopLevelDetails.ote_salary
                ? parseInt(jdTopLevelDetails.ote_salary, 10)
                : null,
              commission_percent: parseFloat(
                jdTopLevelDetails.commission_percent
              ),
              security_clearance: jdTopLevelDetails.security_clearance,
              salary_disclose: jdTopLevelDetails.salary_disclose,
              commission_pay: jdTopLevelDetails.commission_pay,
              private_employer: jdTopLevelDetails.private_employer,
              compensation_type: jdTopLevelDetails.compensation_type,
              hourly_comp_min: jdTopLevelDetails.hourly_comp_min,
              hourly_comp_max: jdTopLevelDetails.hourly_comp_max,
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
  }, []);

  const handleSubmit = async () => {
    try {
      schema.parse(addJD.jobDetails[0]);
      // Save the job details if validation passes
      //const result = await SaveJobDetails(addJD.jobDetails[0], addJD.jdEntryID);
  
      console.log(addJD.jobDetails[0]);
      setValidationErrors({}); // Clear validation errors on successful submission
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors = error.errors.reduce((acc: ValidationErrors, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {} as ValidationErrors);
        setValidationErrors(errors);
        console.log(errors);
      } else {
        // Handle other errors
        console.log(error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-semibold text-base leading-7 text-gray-900">
          Details
        </CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-8 p-4">
        <div>
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              type="text"
              id="title"
              placeholder="Job Title"
              value={addJD.jobDetails[0]?.jobTitle || ""}
              onChange={(e) =>
                setAddJD({
                  jobDetails: [
                    { ...addJD.jobDetails[0], jobTitle: e.target.value },
                  ],
                })
              }
            />
        </div>
        {validationErrors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.jobTitle}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location-type">Location Type</Label>
            {validationErrors.location_type && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.location_type}
              </p>
            )}
            <Select
              value={addJD.jobDetails[0]?.location_type || ""}
              onValueChange={(value) =>
                setAddJD({
                  jobDetails: [
                    { ...addJD.jobDetails[0], location_type: value },
                  ],
                })
              }
            >
              <SelectTrigger id="location-type">
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Location</SelectLabel>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="clearance-type">Clearance</Label>
            {validationErrors.security_clearance && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.security_clearance}
              </p>
            )}
            <Select
              value={addJD.jobDetails[0]?.security_clearance || ""}
              onValueChange={(value) =>
                setAddJD({
                  jobDetails: [
                    { ...addJD.jobDetails[0], security_clearance: value },
                  ],
                })
              }
            >
              <SelectTrigger id="clearance-type">
                <SelectValue placeholder="Select clearance requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Clearance Level</SelectLabel>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="basic">Public Trust</SelectItem>
                  <SelectItem value="elevated">Secret</SelectItem>
                  <SelectItem value="high">Top Secret</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Only show this if location is: onsite */}
        {addJD.jobDetails[0]?.location_type === "onsite" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  placeholder="City"
                  value={addJD.jobDetails[0]?.location?.[0]?.city || ""}
                  onChange={(e) =>
                    setAddJD({
                      jobDetails: [
                        {
                          ...addJD.jobDetails[0],
                          location: [
                            {
                              ...addJD.jobDetails[0]?.location?.[0],
                              city: e.target.value,
                            },
                          ],
                        },
                      ],
                    })
                  }
                />
              </div>
            </div>
            <div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  type="text"
                  id="state"
                  placeholder="State"
                  value={addJD.jobDetails[0]?.location?.[0]?.state || ""}
                  onChange={(e) =>
                    setAddJD({
                      jobDetails: [
                        {
                          ...addJD.jobDetails[0],
                          location: [
                            {
                              ...addJD.jobDetails[0]?.location?.[0],
                              state: e.target.value,
                            },
                          ],
                        },
                      ],
                    })
                  }
                />
              </div>
            </div>
            <div>
              <div>
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input
                  type="text"
                  id="zipcode"
                  placeholder="Zip Code"
                  value={addJD.jobDetails[0]?.location?.[0]?.zipcode || ""}
                  onChange={(e) =>
                    setAddJD({
                      jobDetails: [
                        {
                          ...addJD.jobDetails[0],
                          location: [
                            {
                              ...addJD.jobDetails[0]?.location?.[0],
                              zipcode: e.target.value,
                            },
                          ],
                        },
                      ],
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
        {/* Default show salary - but hide if commission is true */}
        <div className="flex flex-col bg-gray-100/50 rounded-md p-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Switch
                id="disclose-salary"
                checked={addJD.jobDetails[0]?.salary_disclose || false}
                onCheckedChange={(checked) =>
                  setAddJD({
                    jobDetails: [
                      { ...addJD.jobDetails[0], salary_disclose: checked },
                    ],
                  })
                }
              />
              <Label htmlFor="disclose-salary">Disclose Salary</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="compensation-type">Compensation</Label>
              <Select
                value={addJD.jobDetails[0]?.compensation_type || ""}
                onValueChange={(value) =>
                  setAddJD({
                    jobDetails: [
                      { ...addJD.jobDetails[0], compensation_type: value },
                    ],
                  })
                }
              >
                <SelectTrigger id="compensation-type">
                  <SelectValue placeholder="Select compensation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Compensation</SelectLabel>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="commission">Commission Based</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {validationErrors.compensation && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.compensation}
            </p>
          )}

          {addJD.jobDetails[0]?.salary_disclose && (
            <>
              {addJD.jobDetails[0]?.compensation_type === "salary" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-salary">Minimum Salary</Label>
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-sm font-medium">$</span>
                        <Input
                          type="text"
                          id="min-salary"
                          placeholder="Starting Salary"
                          value={addJD.jobDetails[0]?.min_salary || ""}
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            setAddJD({
                              jobDetails: [
                                {
                                  ...addJD.jobDetails[0],
                                  min_salary:
                                    value === "" ? null : parseInt(value, 10),
                                },
                              ],
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div>
                        <Label htmlFor="max-salary">Maximum Salary</Label>

                        <div className="flex flex-row items-center gap-2">
                          <span className="text-sm font-medium">$</span>
                          <Input
                            type="text"
                            id="max-salary"
                            placeholder="Max Salary"
                            value={addJD.jobDetails[0]?.max_salary || ""}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              setAddJD({
                                jobDetails: [
                                  {
                                    ...addJD.jobDetails[0],
                                    max_salary:
                                      value === "" ? null : parseInt(value, 10),
                                  },
                                ],
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {addJD.jobDetails[0]?.compensation_type === "commission" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div>
                        <Label htmlFor="ote-salary">On-Target Earnings</Label>
                        <div className="flex flex-row items-center gap-2">
                          <span className="text-sm font-medium">$</span>
                          <Input
                            type="text"
                            id="ote-salary"
                            placeholder="OTE Salary"
                            value={addJD.jobDetails[0]?.ote_salary || ""}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              setAddJD({
                                jobDetails: [
                                  {
                                    ...addJD.jobDetails[0],
                                    ote_salary:
                                      value === "" ? null : parseInt(value, 10),
                                  },
                                ],
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div>
                        <Label htmlFor="commission-percentage">
                          Commission Split
                        </Label>

                        <div className="flex flex-row items-center gap-2">
                          <Input
                            type="text"
                            id="commission-percentage"
                            placeholder="Percentage"
                            value={
                              addJD.jobDetails[0]?.commission_percent || ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              setAddJD({
                                jobDetails: [
                                  {
                                    ...addJD.jobDetails[0],
                                    commission_percent:
                                      value === "" ? null : parseFloat(value),
                                  },
                                ],
                              });
                            }}
                          />
                          <span className="text-sm font-medium">%</span>
                        </div>
                        {validationErrors.commission_percent && (
          <div className="text-sm text-red-500">{validationErrors.commission_percent}</div>
        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {addJD.jobDetails[0]?.compensation_type === "hourly" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="starting-hourly">Starting Hourly</Label>
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-sm font-medium">$</span>
                      <Input
                        type="text"
                        id="starting-hourly"
                        placeholder="Starting Rate"
                        value={addJD.jobDetails[0]?.hourly_comp_min || ""}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          setAddJD({
                            jobDetails: [
                              {
                                ...addJD.jobDetails[0],
                                hourly_comp_min:
                                  value === "" ? null : parseInt(value, 10),
                              },
                            ],
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="max-hourly">Max Hourly</Label>
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-sm font-medium">$</span>
                      <Input
                        type="text"
                        id="max-hourly"
                        placeholder="Maximum Rate"
                        value={addJD.jobDetails[0]?.hourly_comp_max || ""}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          setAddJD({
                            jobDetails: [
                              {
                                ...addJD.jobDetails[0],
                                hourly_comp_max:
                                  value === "" ? null : parseInt(value, 10),
                              },
                            ],
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 bg-gray-100/50 p-4 rounded-md">
            <Switch
              id="private-hire"
              checked={addJD.jobDetails[0]?.private_employer || false}
              onCheckedChange={(checked) =>
                setAddJD({
                  jobDetails: [
                    { ...addJD.jobDetails[0], private_employer: checked },
                  ],
                })
              }
            />
            <Label htmlFor="private-hire">Private Post</Label>
          </div>
        </div>
        {/* Submit button */}
        <div className="flex flex-row justify-end">
          <Button onClick={handleSubmit}>Post</Button>
        </div>
      </div>

      <CardContent className="text-sm text-gray-700 leading-7"></CardContent>
    </Card>
  );
}
