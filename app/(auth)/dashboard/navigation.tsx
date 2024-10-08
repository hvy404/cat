"use client";

import React, { useState } from 'react';
import useStore from "@/app/state/useStore";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UserRoundPlus,
  LifeBuoy,
  WandSparkles,
  Settings2,
  Home,
  SquareUser,
  LucideIcon,
  BookOpen,
  Search,
  Layers2,
  BriefcaseBusiness,
  GraduationCap,
  Zap,
  User,
  Award,
  Compass,
  Building,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearDashboardWidgetPanel } from "@/lib/dashboard/janitor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the props type for TooltipButton
interface TooltipButtonProps {
  item: string;
  label: string;
  icon: LucideIcon;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  item,
  label,
  icon: Icon,
}) => {
  const { selectedMenuItem, setSelectedMenuItem } = useStore();

  const handleSelect = () => {
    if (item === "dashboard" || item === "talent-dashboard") {
      clearDashboardWidgetPanel();
    }

    setSelectedMenuItem(item);
  };

  const getButtonClass = () => {
    return selectedMenuItem === item ? "rounded-lg bg-muted" : "rounded-lg";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={getButtonClass()}
          aria-label={label}
          onClick={handleSelect}
        >
          <Icon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={5}
        className="bg-black text-white border-black"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default function DashboardNavigation() {
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const onboarded = useStore((state) => state.candidateDashboard.onboarded);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const role = clerkUser?.publicMetadata?.aiq_role as string | undefined;

  const renderNavItems = () => {
    switch (role) {
      case "employer":
      case "employer-trial":
        return (
          <>
            <TooltipButton item="dashboard" label="Dashboard" icon={Home} />
            <TooltipButton
              item="add-job"
              label="Post New Job"
              icon={UserRoundPlus}
            />
            <TooltipButton
              item="jd-builder"
              label="Job Description Wizard"
              icon={Zap}
            />
            <TooltipButton
              item="documents"
              label="Collection"
              icon={BookOpen}
            />
            <TooltipButton item="browse" label="Browse" icon={Search} />
            <TooltipButton
              item="company-profile"
              label="Company Profile"
              icon={Building}
            />
            <TooltipButton item="settings" label="Settings" icon={Settings2} />
          </>
        );
      case "talent":
        if (onboarded) {
          return (
            <>
              <TooltipButton
                item="talent-dashboard"
                label="Dashboard"
                icon={Layers2}
              />
              <TooltipButton
                item="talent-search"
                label="Search"
                icon={Search}
              />
              <TooltipButton
                item="talent-experience"
                label="Experience"
                icon={BriefcaseBusiness}
              />
              <TooltipButton
                item="talent-education"
                label="Education"
                icon={GraduationCap}
              />
              <TooltipButton
                item="talent-certifications"
                label="Certifications"
                icon={Award}
              />
              <TooltipButton
                item="talent-profile"
                label="Personal Profile"
                icon={User}
              />
              <TooltipButton
                item="resume-copilot"
                label="Resume Copilot"
                icon={WandSparkles}
              />
            </>
          );
        } else {
          return (
            <TooltipButton
              item="talent-dashboard"
              label="Resume (Talent)"
              icon={Layers2}
            />
          );
        }
      default:
        return null;
    }
  };

  const getHelpItem = () => {
    return role === "candidate" ? "candidate-help" : "employer-help";
  };

  const handleLogout = async () => {
    await signOut();
    setIsAccountDialogOpen(false);
  };

  return (
    <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
      <div className="border-b p-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Home"
        >
          <Compass className="size-5" />
        </Button>
      </div>
      <nav className="grid gap-1 p-2">{renderNavItems()}</nav>
      <nav className="mt-auto grid gap-1 p-2">
        <TooltipButton item={getHelpItem()} label="Help" icon={LifeBuoy} />
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Account"
            >
              <SquareUser className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account Options</DialogTitle>
              <DialogDescription>
                Manage your account settings or sign out.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4 mt-4">
              <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                Account Settings
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </nav>
    </aside>
  );
}