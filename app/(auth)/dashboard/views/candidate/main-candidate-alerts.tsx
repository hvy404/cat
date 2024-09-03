import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronRight,
  X,
  AlertCircle,
  Calendar,
  Briefcase,
  Mail,
  Inbox,
  Building,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAlerts,
  updateAlert,
  deleteAlert,
  Alert,
} from "@/lib/alerts/alert-crud";
import {
  getInviteAlertDetails,
  InviteDetails,
} from "@/lib/alerts/candidate-get-invite-details";
import { toast } from "sonner";

interface AlertsCardProps {
  onAlertAction: (alertType: string, jobId: string) => void;
  refreshTrigger?: number;
  onDeleteSuccess?: () => void;
}

const AlertsCard: React.FC<AlertsCardProps> = ({
  onAlertAction,
  refreshTrigger,
  onDeleteSuccess,
}) => {
  const { user: clerkUser } = useUser();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;

  useEffect(() => {
    fetchAlerts();
  }, [candidateId, refreshTrigger]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      if (candidateId) {
        const fetchedAlerts = await getAlerts(candidateId);
        if (fetchedAlerts) {
          setAlerts(fetchedAlerts as Alert[]);
        }
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAlert = async (id: string, updates: Partial<Alert>) => {
    try {
      const updatedAlert = await updateAlert(id, updates);
      if (updatedAlert) {
        setAlerts(
          alerts.map((alert) => (alert.id === id ? updatedAlert : alert))
        );
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const success = await deleteAlert(id);
      if (success) {
        setAlerts(alerts.filter((alert) => alert.id !== id));
        toast.success("Alert deleted successfully");
        onDeleteSuccess?.(); // Call the callback if it exists
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
    }
  };

  const handleAlertAction = (alertType: string, jobId: string | undefined) => {
    if (jobId) {
      onAlertAction(alertType, jobId);
      closeAlertDialog();
    } else {
      console.error("Job ID is undefined");
    }
  };

  const unreadCount = alerts.filter(
    (alert) => alert.status === "unread"
  ).length;

  const alertTypeColors = {
    match: "bg-blue-500",
    invite: "bg-green-500",
    application: "bg-purple-500",
  };

  const getAlertDotStyle = (alert: Alert) => {
    if (alert.status === "read") {
      return "w-2 h-2 rounded-full border border-gray-300";
    }
    return `w-2 h-2 rounded-full ${alertTypeColors[alert.type]}`;
  };

  const filteredAlerts = showOnlyUnread
    ? alerts.filter((alert) => alert.status === "unread")
    : alerts;

  const toggleFilter = () => setShowOnlyUnread(!showOnlyUnread);

  const openAlertDialog = async (alert: Alert) => {
    setSelectedAlert(alert);
    if (alert.status === "unread") {
      handleUpdateAlert(alert.id, { status: "read" });
    }

    if (alert.type === "invite") {
      setIsLoadingDetails(true);
      try {
        const details = await getInviteAlertDetails(alert.reference_id);
        setInviteDetails(details);
      } catch (error) {
        console.error("Error fetching invite details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    } else {
      setInviteDetails(null);
    }
  };

  const closeAlertDialog = () => {
    setSelectedAlert(null);
    setInviteDetails(null);
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case "match":
        return "New AI Match";
      case "invite":
        return "Interview Invitation";
      case "application":
        return "Candidate Application";
      default:
        return "New Alert";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "match":
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      case "invite":
        return <AlertCircle className="w-6 h-6 text-green-500" />;
      case "application":
        return <AlertCircle className="w-6 h-6 text-purple-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const emptyStateMessages = [
    "Your profile is live and active!",
    "Ready to receive great opportunities soon!",
    "Your job search is set up for success!",
    "Exciting job matches are just around the corner!",
    "Your next great opportunity could be coming any moment!",
    "Stay tuned for potential perfect matches!",
    "Your profile is out there working for you!",
    "Keep an eye out, top employers may be viewing your profile!",
    "You're all set to attract amazing job opportunities!",
    "Get ready for a flood of exciting job prospects!",
  ];

  const EmptyState = () => {
    const randomMessage = useMemo(() => {
      const randomIndex = Math.floor(Math.random() * emptyStateMessages.length);
      return emptyStateMessages[randomIndex];
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Inbox className="w-10 h-10 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center text-sm">
          No alerts at the moment.
          <br />
          {randomMessage}
        </p>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );

  return (
    <>
      <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-2 text-gray-500" />
              <span>Alerts</span>
            </div>
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFilter}
                className="px-2 py-1 h-auto font-normal"
              >
                {showOnlyUnread ? (
                  <span className="flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    Clear filter
                  </span>
                ) : (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[180px] px-4 py-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <span className="text-gray-500">Loading alerts...</span>
              </div>
            ) : filteredAlerts.length > 0 ? (
              <AnimatePresence>
                {filteredAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => openAlertDialog(alert)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={getAlertDotStyle(alert)} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {getAlertTitle(alert)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <EmptyState />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={selectedAlert !== null} onOpenChange={closeAlertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              <span>{selectedAlert && getAlertTitle(selectedAlert)}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-md">
            {isLoadingDetails ? (
              <LoadingSkeleton />
            ) : selectedAlert?.type === "invite" && inviteDetails ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <p className="font-semibold">{inviteDetails.b}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gray-500" />
                  <p>Employer: {inviteDetails.c}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <p>Email: {inviteDetails.d}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p>
                    Invited on: {new Date(inviteDetails.f).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {selectedAlert?.description}
              </p>
            )}
          </div>
          <Separator className="my-4" />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeAlertDialog}>
              Close
            </Button>
            {selectedAlert?.action_required && (
              <Button
                variant={"destructive"}
                onClick={() => {
                  if (selectedAlert) {
                    handleDeleteAlert(selectedAlert.id);
                    closeAlertDialog();
                  }
                }}
              >
                Delete
              </Button>
            )}
            {selectedAlert?.type === "invite" && (
              <Button
                onClick={() => handleAlertAction("invite", inviteDetails?.g)}
              >
                View Job Posting
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsCard;
