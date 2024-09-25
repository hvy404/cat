import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  updatePersonalProfile,
  retrievePersonalProfile,
} from "@/lib/employer/personal-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { countActiveJobs } from "@/lib/employer/get-active-jobs-count";
import { Progress } from "@/components/ui/progress";
import { checkUserSubscription } from "@/lib/employer/get-subscription-level";

interface ActivePanelProps {
  onMouseEnter: (panel: string) => void;
  onMouseLeave: () => void;
}

export function MyProfileForm({
  onMouseEnter,
  onMouseLeave,
}: ActivePanelProps) {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    contact_email: "",
    email_match: false,
    email_applicant: false,
  });
  const [subscriptionLevel, setSubscriptionLevel] = useState<string | null>(
    null
  );
  const [subscriptionData, setSubscriptionData] = useState<{
    level: string | null;
    endDate: string | null;
  }>({ level: null, endDate: null });

  const [isLoading, setIsLoading] = useState(true);
  const [activeJobCount, setActiveJobCount] = useState<number | null>(null);

  // Clerk
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!cuid) {
        setIsLoading(false);
        toast.error("Please log in to view your profile.");
        return;
      }

      try {
        const { level, endDate } = await checkUserSubscription(cuid);
        setSubscriptionData({ level, endDate });
        setSubscriptionLevel(level);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to load subscription data. Please try again.");
      }
    }
    fetchSubscriptionData();
  }, [cuid]);

  useEffect(() => {
    async function fetchData() {
      if (!cuid) {
        setIsLoading(false);
        toast.error("Please log in to view your profile.");
        return;
      }

      try {
        const data = await retrievePersonalProfile(cuid);
        setProfile(data);
        const count = await countActiveJobs(cuid);
        setActiveJobCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [cuid]);

  useEffect(() => {
    async function fetchProfile() {
      if (!cuid) {
        setIsLoading(false);
        toast.error("Please log in to view your profile.");
        return;
      }

      try {
        const data = await retrievePersonalProfile(cuid);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [cuid]);

  if (!cuid) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => {
    setProfile((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePersonalProfile(cuid, profile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[150px] w-full rounded-lg" />
        <Skeleton className="h-[40px] w-[100px]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Personal</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="First name"
            value={profile.first_name}
            onChange={handleInputChange}
          />
          <Input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Last name"
            value={profile.last_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            id="contact_email"
            name="contact_email"
            placeholder="Email"
            value={profile.contact_email}
            onChange={handleInputChange}
            readOnly
          />
        </div>
      </div>

      {/* Subscription Level */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">
          Subscription Level
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Card
            className={`flex-1 ${
              subscriptionLevel === "employer_monthly" ||
              subscriptionLevel === "employer_yearly"
                ? "border-blue-500 border-2"
                : "border-gray-200"
            }`}
          >
            <CardHeader className="font-semibold text-lg">Premium</CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Access to all features</p>
            </CardContent>
          </Card>
          <Card
            className={`flex-1 ${
              subscriptionData.level === "employer_trial"
                ? "border-blue-500 border-2"
                : "border-gray-200"
            }`}
          >
            <CardHeader className="font-semibold text-lg">Trial</CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Experience recruiting at scale for 30 days
              </p>
              {subscriptionData.level === "employer_trial" &&
                subscriptionData.endDate && (
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Trial ends on:</span>{" "}
                    {new Date(subscriptionData.endDate).toLocaleDateString()}
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Job Count */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-gray-800 text-sm font-semibold">
            Active AI Recruitment Campaigns
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger type="button">
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="bg-black border-0 text-white">
                <p className="max-w-xs">
                  AI-Powered Talent Searches represent your active, AI-driven
                  recruitment campaigns. This is not a one-time use credit, but
                  an ongoing allocation. You have the flexibility to switch jobs
                  between AI-powered and traditional posting modes. When you
                  pause AI matching for a job, it automatically becomes a
                  standard job listing, freeing up that AI-Powered Talent Search
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {activeJobCount !== null ? activeJobCount : 0}/100
            </span>
            <span className="text-sm text-gray-600">
              {activeJobCount !== null ? (activeJobCount / 100) * 100 : 0}%
            </span>
          </div>
          <Progress
            value={activeJobCount !== null ? (activeJobCount / 100) * 100 : 0}
            className="w-full"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Notifications</h2>
        <div className="flex flex-col gap-4">
          {/* Switch 1 */}
          <div
            onMouseEnter={() => onMouseEnter("ai-match")}
            onMouseLeave={onMouseLeave}
            className="flex flex-row justify-between border border-1 border-gray-200 hover:border-2 hover:border-gray-800 rounded-md p-4"
          >
            <p className="text-sm text-gray-700 font-normal">
              Get emails for AI talent matches
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                id="email_match"
                checked={profile.email_match}
                onCheckedChange={() => handleSwitchChange("email_match")}
              />
            </div>
          </div>

          {/* Switch 2 */}
          <div
            onMouseEnter={() => onMouseEnter("applicant-alert")}
            onMouseLeave={onMouseLeave}
            className="flex flex-row justify-between border border-1 border-gray-200 hover:border-2 hover:border-gray-800 rounded-md p-4"
          >
            <p className="text-sm text-gray-700 font-normal">
              Email alerts for new applicants
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                id="email_applicant"
                checked={profile.email_applicant}
                onCheckedChange={() => handleSwitchChange("email_applicant")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
