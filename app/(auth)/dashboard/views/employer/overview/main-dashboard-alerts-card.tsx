import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import {
  Bell,
  ChevronRight,
  X,
  AlertCircle,
  Calendar,
  User,
  Inbox,
  Briefcase,
  Mail,
  FileText,
  Star,
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
  ApplicationDetails,
} from "@/lib/alerts/employer-application-alert-details";
import {
  getMatchAlertDetails,
  MatchDetails,
} from "@/lib/alerts/employer-match-alert-details";
import { useUser } from "@clerk/nextjs";

interface ExtendedMatchDetails extends MatchDetails {
  status: string;
}

const AlertsCard: React.FC = () => {
  // Clerk
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const { setEmployerRightPanelView } = useStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetails | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        if (cuid) {
          const fetchedAlerts = await getAlerts(cuid);
          if (fetchedAlerts) {
            setAlerts(fetchedAlerts as Alert[]);
          }
        }
      } catch (error) {
        // Error handling can be done here if needed
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAlerts();
  }, [cuid]);
  

  const handleUpdateAlert = async (id: string, updates: Partial<Alert>) => {
    try {
      const updatedAlert = await updateAlert(id, updates);
      if (updatedAlert) {
        setAlerts(
          alerts.map((alert) => (alert.id === id ? updatedAlert : alert))
        );
      }
    } catch (error) {
      //console.error("Error updating alert:", error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const success = await deleteAlert(id);
      if (success) {
        setAlerts(alerts.filter((alert) => alert.id !== id));
      }
    } catch (error) {
      //console.error("Error deleting alert:", error);
    }
  };

  const handleAlertAction = (
    alertType: string,
    ref: string,
    details?: ApplicationDetails | MatchDetails
  ) => {
    if (alertType === "application" && details) {
      setEmployerRightPanelView("inboundApplications", {
        applicationId: ref,
      });
    } else if (alertType === "invite") {
      setEmployerRightPanelView("inboundApplications");
    } else if (alertType === "match" && details) {
      setEmployerRightPanelView("aiRecommendations", {
        selectedRecommendationId: ref,
        selectedRecommendationStatus: (details as ExtendedMatchDetails).status,
      });
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
      const result = await getApplicationAlertDetails(alert.reference_id);
      if ("error" in result) {
        setErrorMessage(
          `There was an error retrieving application details. Please try again.`
        );
        setApplicationDetails(null);
      } else {
        setApplicationDetails(result);
        setErrorMessage(null);
      }
      setMatchDetails(null);
    } else if (alert.type === "match") {
      const result = await getMatchAlertDetails(alert.reference_id);
      if ("error" in result) {
        setErrorMessage(
          `There was an error retrieving match details. Please try again.`
        );
        setMatchDetails(null);
      } else {
        setMatchDetails(result);
        setErrorMessage(null);
      }
      setApplicationDetails(null);
    } else {
      setApplicationDetails(null);
      setMatchDetails(null);
      setErrorMessage(null);
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
            {errorMessage ? (
              <div className="text-sm text-gray-800">{errorMessage}</div>
            ) : selectedAlert?.type === "application" && applicationDetails ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <p className="font-semibold">{applicationDetails.b}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <p>Candidate: {applicationDetails.c}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <p>Email: {applicationDetails.d}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <p>Status: {applicationDetails.e}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p>
                    Applied on:{" "}
                    {new Date(applicationDetails.f).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : selectedAlert?.type === "match" && matchDetails ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <p className="font-semibold">{matchDetails.a}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <p>Candidate: {matchDetails.b}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p>
                    Matched on: {new Date(matchDetails.d).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {selectedAlert?.description}
              </p>
            )}
          </div>
          <Separator className="my-4" />{" "}
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
            {selectedAlert?.type === "application" && !errorMessage && applicationDetails && (
  <Button
    onClick={() => {
      if (selectedAlert) {
        setEmployerRightPanelView("inboundApplications", {
          applicationId: selectedAlert.reference_id,
        });
        handleAlertAction(
          selectedAlert.type,
          selectedAlert.reference_id,
          applicationDetails
        );
      }
      closeAlertDialog();
    }}
  >
    View Full Application
  </Button>
)}

            {selectedAlert?.type === "invite" && (
              <Button
                onClick={() => {
                  if (selectedAlert) {
                    handleAlertAction(
                      selectedAlert.type,
                      selectedAlert.reference_id
                    );
                  }
                  closeAlertDialog();
                }}
              >
                View Invite Details
              </Button>
            )}
            {selectedAlert?.type === "match" && matchDetails && (
              <Button
                onClick={() => {
                  if (selectedAlert && matchDetails) {
                    handleAlertAction(
                      selectedAlert.type,
                      selectedAlert.reference_id,
                      matchDetails
                    );
                  }
                  closeAlertDialog();
                }}
              >
                View Candidate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsCard;
