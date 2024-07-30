import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import {
  Bell,
  ChevronRight,
  X,
  AlertCircle,
  Calendar,
  Hash,
  User,
  Inbox,
  Type,
  Briefcase,
  Mail,
  FileText,
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
import {
  getAlerts,
  updateAlert,
  deleteAlert,
  Alert,
} from "@/lib/alerts/alert-crud";
import {
  getApplicationAlertDetails,
  ApplicationAlertDetails,
} from "@/lib/alerts/employer-application-alert-details";

const AlertsCard: React.FC = () => {
  const { user } = useStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationAlertDetails | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      if (user && user.uuid) {
        const fetchedAlerts = await getAlerts(user.uuid);
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
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
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

    if (alert.type === "application") {
      const details = await getApplicationAlertDetails(alert.reference_id);
      console.log(details);
      setApplicationDetails(details);
    } else {
      setApplicationDetails(null);
    }
  };

  const closeAlertDialog = () => {
    setSelectedAlert(null);
    setApplicationDetails(null);
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
    "Your job postings are live and active!",
    "Ready to receive great applications soon!",
    "Your recruitment pipeline is set up for success!",
    "Exciting candidates are just around the corner!",
    "Your next great hire could be applying any moment!",
    "Stay tuned for potential perfect matches!",
    "Your job opportunities are out there working for you!",
    "Keep an eye out, top talent may be viewing your posts!",
    "You're all set to attract amazing candidates!",
    "Get ready for a flood of qualified applicants!",
  ];

  const EmptyState = () => {
    const randomMessage = useMemo(() => {
      const randomIndex = Math.floor(Math.random() * emptyStateMessages.length);
      return emptyStateMessages[randomIndex];
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Inbox className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center text-sm">
          No alerts at the moment.
          <br />
          {randomMessage}
        </p>
      </div>
    );
  };

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
            {selectedAlert?.type === "application" && applicationDetails ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <p className="font-semibold">
                    {applicationDetails.job_title}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <p>Candidate: {applicationDetails.candidate_name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <p>Email: {applicationDetails.candidate_email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <p>Status: {applicationDetails.application_status}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p>
                    Applied on:{" "}
                    {new Date(
                      applicationDetails.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <p>Resume ID: {applicationDetails.resume_id}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {selectedAlert?.description}
              </p>
            )}
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4">
            {selectedAlert?.type !== "application" && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">User ID:</span>
                <span className="text-sm">{selectedAlert?.user_id}</span>
              </div>
            )}
          </div>
          {selectedAlert?.action_required && (
            <div className="mt-4">
              <Badge
                variant="destructive"
                className="w-full justify-center py-1"
              >
                Action Required
              </Badge>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeAlertDialog}>
              Close
            </Button>
            {selectedAlert?.action_required && (
              <Button
                onClick={() => {
                  // Handle the action here
                  console.log("Taking action on alert:", selectedAlert.id);
                  closeAlertDialog();
                }}
              >
                Take Action
              </Button>
            )}
            {selectedAlert?.type === "application" && (
              <Button
                onClick={() => {
                  // Handle viewing the full application here
                  console.log(
                    "Viewing full application:",
                    applicationDetails?.application_id
                  );
                  closeAlertDialog();
                }}
              >
                View Full Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsCard;
