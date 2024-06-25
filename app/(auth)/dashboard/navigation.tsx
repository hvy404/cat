"use client";
import useStore from "@/app/state/useStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UserRoundPlus,
  LifeBuoy,
  Folder,
  Settings2,
  Home,
  SquareUser,
  UsersRound,
  LucideIcon,
  BookOpen,
  Search,
  Layers2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the props type for TooltipButton
interface TooltipButtonProps {
  item: string;
  label: string;
  icon: LucideIcon;
}

// Reusable TooltipButton component with typed props
const TooltipButton: React.FC<TooltipButtonProps> = ({ item, label, icon: Icon }) => {
  const { selectedMenuItem, setSelectedMenuItem } = useStore();

  const handleSelect = () => {
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
      <TooltipContent side="right" sideOffset={5} className="bg-black text-white border-black">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default function EmployerDashboardNavigation() {
  const { setSelectedMenuItem } = useStore(); // Correctly access setSelectedMenuItem

  return (
    <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
      <div className="border-b p-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Home"
          onClick={() => setSelectedMenuItem("home")}
        >
          <UsersRound className="size-5" />
        </Button>
      </div>
      <nav className="grid gap-1 p-2">
        <TooltipButton item="dashboard" label="Dashboard" icon={Home} />
        <TooltipButton item="add-job" label="Add Job" icon={UserRoundPlus} />
        <TooltipButton item="jd-builder" label="JD Builder" icon={Folder} />
        <TooltipButton item="documents" label="Collection" icon={BookOpen} />
        <TooltipButton item="browse" label="Browse" icon={Search} />
        <TooltipButton item="settings" label="Settings" icon={Settings2} />
        <TooltipButton item="talent-resume" label="Resume (Talent)" icon={Layers2} />
      </nav>
      <nav className="mt-auto grid gap-1 p-2">
        <TooltipButton item="help" label="Help" icon={LifeBuoy} />
        <TooltipButton item="account" label="Account" icon={SquareUser} />
      </nav>
    </aside>
  );
}
