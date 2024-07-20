import React, { useState, useEffect } from 'react';
import useStore from "@/app/state/useStore";
import { getResumes } from "@/lib/candidate/apply/resume-choice";
import { setDefaultResume } from "@/lib/candidate/apply/resume-set-default";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, File, AlertCircle, Info } from "lucide-react";
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

export default function CandidateSettingOptions() {
  const { user } = useStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [autoFindJobs, setAutoFindJobs] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [allowInterviewInvites, setAllowInterviewInvites] = useState(false);

  useEffect(() => {
    async function fetchResumes() {
      if (user) {
        try {
          const fetchedResumes = await getResumes(user.uuid);
          setResumes(fetchedResumes as Resume[]);
        } catch (err) {
          setError("Failed to fetch resumes");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchResumes();
  }, [user]);

  const handleSetDefault = async (resumeAddress: string) => {
    if (!user) return;

    setUpdating(true);
    try {
      await setDefaultResume(user.uuid, resumeAddress);
      setResumes(
        resumes.map((resume) => ({
          ...resume,
          default: resume.address === resumeAddress,
        }))
      );
      const newDefaultResume = resumes.find(resume => resume.address === resumeAddress);
      toast.success(`Default resume set to "${newDefaultResume?.resume_name}"`, {
        description: "This resume will be used for automatic job matching.",
        duration: 3000,
      });
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

  const handleToggle = (setting: string, value: boolean) => {
    console.log(`Toggle ${setting}:`, value);
    switch (setting) {
      case 'autoFindJobs':
        setAutoFindJobs(value);
        break;
      case 'receiveEmails':
        setReceiveEmails(value);
        break;
      case 'allowInterviewInvites':
        setAllowInterviewInvites(value);
        break;
    }
  };

  if (!user) return null;

  return (
    <>
    <Card className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-md font-semibold text-gray-800 mb-2">Manage Resumes</h2>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your default resume will be automatically sent to employers when our platform finds an ideal job opportunity match. Choose the resume that best represents your current skills and experience.
          </AlertDescription>
        </Alert>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full bg-gray-100 rounded-lg" />
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
                    resume.default ? 'border-slate-400' : 'border-gray-200'
                  } transition-all duration-300 hover:shadow-md ${
                    resume.default ? 'shadow-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${resume.default ? 'bg-slate-100' : 'bg-gray-200'}`}>
                        <File className={`h-6 w-6 ${resume.default ? 'text-slate-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-gray-800">
                          {resume.resume_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {resume.default ? 'Default Resume' : 'Click to set as default'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSetDefault(resume.address)}
                      disabled={resume.default || updating}
                      variant={resume.default ? "outline" : "default"}
                      size="sm"
                      className={`transition-all duration-300 ${
                        resume.default
                          ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
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
              </motion.li>
            ))}
          </motion.ul>
        )}
      </CardContent>
    </Card>
    <Card className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-md font-semibold text-gray-800 mb-4">Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-find-jobs" className="text-base">
                  Automatic Job Matching
                </Label>
                <p className="text-sm text-gray-500">
                  Allow our AI to find and suggest job opportunities based on your profile
                </p>
              </div>
              <Switch
                id="auto-find-jobs"
                checked={autoFindJobs}
                onCheckedChange={(value) => handleToggle('autoFindJobs', value)}
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
                checked={receiveEmails}
                onCheckedChange={(value) => handleToggle('receiveEmails', value)}
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
                checked={allowInterviewInvites}
                onCheckedChange={(value) => handleToggle('allowInterviewInvites', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}