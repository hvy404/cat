import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { getResumes } from "@/lib/candidate/apply/resume-choice";
import { setDefaultResume } from "@/lib/candidate/preferences/resume-set-default";
import { deleteResume } from "@/lib/candidate/preferences/delete-custom-resume";
import {
  getCandidatePreferences,
  updateCandidatePreferences,
} from "@/lib/candidate/preferences/candidate-prefrences";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, File, AlertCircle, Info, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Resume {
  resume_name: string;
  address: string;
  default: boolean;
}

interface CandidatePreferences {
  matching_opt_in: boolean;
  email_alert_opt_in: boolean;
  interview_invite_opt_in: boolean;
}

type ActiveInfoType = "default" | "resumes" | "preferences";

interface CandidateSettingOptionsProps {
  setActiveInfo: (info: ActiveInfoType) => void;
}

export default function CandidateSettingOptions({
  setActiveInfo,
}: CandidateSettingOptionsProps) {
  const { user: clerkUser } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [preferences, setPreferences] = useState<CandidatePreferences>({
    matching_opt_in: false,
    email_alert_opt_in: false,
    interview_invite_opt_in: false,
  });

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;

  useEffect(() => {
    async function fetchData() {
      if (candidateId) {
        try {
          const [fetchedResumes, fetchedPreferences] = await Promise.all([
            getResumes(candidateId),
            getCandidatePreferences(candidateId),
          ]);
          setResumes(fetchedResumes as Resume[]);
          setPreferences(fetchedPreferences);
        } catch (err) {
          setError("Failed to fetch data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [candidateId]);

  const handleSetDefault = async (resumeAddress: string) => {
    if (!candidateId) return;

    setUpdating(true);
    try {
      await setDefaultResume(candidateId, resumeAddress);
      setResumes(
        resumes.map((resume) => ({
          ...resume,
          default: resume.address === resumeAddress,
        }))
      );
      const newDefaultResume = resumes.find(
        (resume) => resume.address === resumeAddress
      );
      toast.success(
        `Default resume set to "${newDefaultResume?.resume_name}"`,
        {
          description: "This resume will be used for automatic job matching.",
          duration: 3000,
        }
      );
    } catch (err) {
      setError("Failed to set default resume");
      console.error(err);
      toast.error("Failed to set default resume", {
        description: "Please try again later.",
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggle = async (
    setting: keyof CandidatePreferences,
    value: boolean
  ) => {
    if (!candidateId) return;

    setUpdating(true);
    try {
      const updatedPreferences = { ...preferences, [setting]: value };
      await updateCandidatePreferences(candidateId, { [setting]: value });
      setPreferences(updatedPreferences);
      toast.success("Preference updated successfully", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to update preference:", error);
      toast.error("Failed to update preference. Please try again.", {
        duration: 3000,
      });
      // Revert the local state change
      setPreferences((prev) => ({ ...prev, [setting]: !value }));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteResume = async (resumeAddress: string) => {
    if (!candidateId) return;

    setUpdating(true);
    try {
      await deleteResume(candidateId, resumeAddress);
      setResumes(resumes.filter((resume) => resume.address !== resumeAddress));
      toast.success("Resume deleted successfully", {
        description: "The resume has been removed from your profile.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to delete resume:", err);
      toast.error("Failed to delete resume", {
        description: "Please try again later.",
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!candidateId) return null;

  return (
    <>
      <Card className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-semibold text-gray-800">
              Manage Resumes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveInfo("resumes")}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your default resume will be automatically sent to employers when
              our platform finds an ideal job opportunity match. Choose the
              resume that best represents your current skills and experience.
            </AlertDescription>
          </Alert>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 w-full bg-gray-100 rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : resumes.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Resumes Found</AlertTitle>
              <AlertDescription>Add a resume to get started.</AlertDescription>
            </Alert>
          ) : (
            <motion.ul className="space-y-4">
              {resumes.map((resume) => (
                <motion.li
                  key={resume.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`bg-gray-50 p-4 rounded-lg border ${
                      resume.default ? "border-slate-400" : "border-gray-200"
                    } transition-all duration-300 hover:shadow-md ${
                      resume.default ? "shadow-slate-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            resume.default ? "bg-slate-100" : "bg-gray-200"
                          }`}
                        >
                          <File
                            className={`h-6 w-6 ${
                              resume.default
                                ? "text-slate-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-md text-gray-800">
                            {resume.resume_name}
                          </h3>
                         
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleDeleteResume(resume.address)}
                          disabled={updating || resume.default}
                          variant="link"
                          size="sm"
                        >
                          <span className="font-normal text-gray-600">Delete Resume</span>
                        </Button>
                        <Button
                          onClick={() => handleSetDefault(resume.address)}
                          disabled={resume.default || updating}
                          variant={resume.default ? "outline" : "default"}
                          size="sm"
                          className={`transition-all duration-300 ${
                            resume.default
                              ? "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {resume.default ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Default
                            </>
                          ) : (
                            "Set as Default"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </CardContent>
      </Card>
      <Card className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-md font-semibold text-gray-800">Preferences</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveInfo("preferences")}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-find-jobs" className="text-base">
                  Automatic Job Matching
                </Label>
                <p className="text-sm text-gray-500">
                  Allow our AI to find and suggest job opportunities based on
                  your profile
                </p>
              </div>
              <Switch
                id="auto-find-jobs"
                checked={preferences.matching_opt_in}
                onCheckedChange={(value) =>
                  handleToggle("matching_opt_in", value)
                }
                disabled={updating}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="receive-emails" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive updates about new job recommendations via email
                </p>
              </div>
              <Switch
                id="receive-emails"
                checked={preferences.email_alert_opt_in}
                onCheckedChange={(value) =>
                  handleToggle("email_alert_opt_in", value)
                }
                disabled={updating}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-invites" className="text-base">
                  Interview Invitations
                </Label>
                <p className="text-sm text-gray-500">
                  Allow employers to send you interview invitations directly
                </p>
              </div>
              <Switch
                id="allow-invites"
                checked={preferences.interview_invite_opt_in}
                onCheckedChange={(value) =>
                  handleToggle("interview_invite_opt_in", value)
                }
                disabled={updating}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
