import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronRight, X, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  getUserAlerts, 
  markAlertAsRead, 
  deleteAlert, 
  hasUnreadAlerts,
  getAlertDetails
} from "@/lib/alerts/get-alerts"

interface Alert {
  id: number;
  user_id: string;
  type: 'match' | 'invite' | 'application';
  message: string;
  created_at: string;
  read: boolean;
  reference_id: string;
}

interface DetailedAlert extends Alert {
  details?: any;
}

const alertTypeColors = {
  match: 'bg-blue-500',
  invite: 'bg-green-500',
  application: 'bg-purple-500',
};

export function CandidateAlertsCard({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<DetailedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<DetailedAlert | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      const unreadExists = await hasUnreadAlerts(userId);
      setHasUnread(unreadExists);
      const result = await getUserAlerts(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setAlerts(result.alerts || []);
      }
      setLoading(false);
    }

    fetchAlerts();
  }, [userId]);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const getAlertDotStyle = (alert: Alert) => {
    if (alert.read) {
      return 'w-2 h-2 rounded-full border border-gray-300';
    }
    return `w-2 h-2 rounded-full ${alertTypeColors[alert.type]}`;
  };

  const filteredAlerts = showOnlyUnread ? alerts.filter(alert => !alert.read) : alerts;

  const toggleFilter = () => setShowOnlyUnread(!showOnlyUnread);

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case 'match':
        return 'New Job Match';
      case 'invite':
        return 'Interview Invitation';
      case 'application':
        return 'Application Update';
      default:
        return 'New Alert';
    }
  };

  const handleAlertClick = async (alert: DetailedAlert) => {
    setSelectedAlert(alert);
    if (!alert.read) {
      const result = await markAlertAsRead(alert.id);
      if (!result.error) {
        setAlerts(alerts.map(a => a.id === alert.id ? { ...a, read: true } : a));
        setHasUnread(alerts.some(a => a.id !== alert.id && !a.read));
      }
    }

    const details = await getAlertDetails(alert);
    if (details && !details.error) {
      setSelectedAlert({ ...alert, details: details });
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    const result = await deleteAlert(alertId);
    if (result.success) {
      setAlerts(alerts.filter(a => a.id !== alertId));
      setHasUnread(alerts.some(a => a.id !== alertId && !a.read));
    } else {
      // Handle error
      console.error('Failed to delete alert:', result.error);
    }
  };

  const renderAlertDetails = (alert: DetailedAlert) => {
    if (!alert.details) return null;

    switch (alert.type) {
      case 'match':
        const jobDetails = alert.details.jobDetails;
        return (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{jobDetails.title}</h3>
            <p className="text-sm">{jobDetails.company_name} - {jobDetails.location}</p>
            <p className="text-sm">Salary Range: {jobDetails.salary_range}</p>
          </div>
        );
      case 'invite':
        const inviteDetails = alert.details.inviteDetails;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{inviteDetails.job_postings.title}</h3>
              <p className="text-sm">Company: {inviteDetails.job_postings.company_name}</p>
              <p className="text-sm">Location: {inviteDetails.job_postings.location}</p>
              {inviteDetails.job_postings.salary_range && (
                <p className="text-sm">Salary Range: {inviteDetails.job_postings.salary_range}</p>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Invitation Details</h4>
              <p className="text-sm">Recruiter: {inviteDetails.employers.name}</p>
              <p className="text-sm">Status: {inviteDetails.status}</p>
              <p className="text-sm">Message: {inviteDetails.message}</p>
            </div>
          </div>
        );
      case 'application':
        const appDetails = alert.details.applicationDetails;
        return (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{appDetails.job_postings.title}</h3>
            <p className="text-sm">Company: {appDetails.job_postings.company_name}</p>
            <p className="text-sm">Location: {appDetails.job_postings.location}</p>
            <p className="text-sm">Status: {appDetails.status}</p>
            <p className="text-sm">Applied on: {new Date(appDetails.applied_at).toLocaleDateString()}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-full bg-white shadow-sm">
        <CardContent className="flex items-center justify-center h-[228px]">
          <div className="w-8 h-8 border-t-2 border-gray-500 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full bg-white shadow-sm">
        <CardContent className="flex items-center justify-center h-[228px]">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-4 h-4 mr-2 text-gray-500" />
            <span>Alerts</span>
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[180px] px-4 py-2">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between w-full" onClick={() => handleAlertClick(alert)}>
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
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{getAlertTitle(alert)}</DialogTitle>
                      <DialogDescription>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                        <p className="text-base text-gray-700 mb-4">{alert.message}</p>
                        {renderAlertDetails(alert)}
                      </DialogDescription>
                    </DialogHeader>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="mt-4"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Alert
                    </Button>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default CandidateAlertsCard;