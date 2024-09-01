import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createInvite,
  checkExistingInvite,
} from "@/lib/employer/create-invite";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { UserPlus, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { updateMatchStatus } from "@/lib/employer/update-match-status";

interface InviteUserDialogProps {
  candidateId: string;
  jobId: string;
  matchId: string;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  candidateId,
  jobId,
  matchId,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inviteExists, setInviteExists] = React.useState(false);
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  React.useEffect(() => {
    const checkInvite = async () => {
      if (cuid) {
        const exists = await checkExistingInvite(cuid, candidateId, jobId);
        setInviteExists(exists);
      }
    };
    checkInvite();
  }, [cuid, candidateId, jobId]);

  if (!cuid) return null;

  const handleInvite = async () => {
    if (inviteExists) return;

    const result = await createInvite(cuid, candidateId, jobId);
    if (result.success) {
      toast.success(result.message);
      setInviteExists(true);
      try {
        await updateMatchStatus(matchId, "contacted");
        toast.success("Match status updated to contacted");
      } catch (error) {
        toast.error("Failed to update match status");
      }
    } else {
      toast.error(result.message);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {inviteExists ? "Invite Sent" : "Invite Candidate"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Extend an Invitation
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            You're about to connect with a promising candidate. This invitation
            could be the first step towards a great professional relationship.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="text-base font-semibold mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
              We'll craft a personalized introduction
            </li>
            <li className="flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 text-green-500" />
              The candidate will receive a warm welcome
            </li>
            <li className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4 text-purple-500" />
              We'll guide them through the application process
            </li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-start">
          {!inviteExists && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Review Later
            </Button>
          )}
          {!inviteExists ? (
            <Button onClick={handleInvite} className="sm:ml-4">
              Send Invitation
            </Button>
          ) : (
            <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-md">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span className="text-sm font-medium">Invite already sent</span>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
