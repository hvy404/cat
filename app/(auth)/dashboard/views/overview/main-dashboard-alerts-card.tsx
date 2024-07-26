import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronRight, X, AlertCircle, Calendar, Hash, User, Type } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Alert {
  id: number;
  user_id: number;
  type: 'match' | 'invite' | 'application';
  reference_id: number;
  status: 'unread' | 'read';
  created_at: string;
  description: string;
  actionRequired: boolean;
}

const alertTypeColors = {
  match: 'bg-blue-500',
  invite: 'bg-green-500',
  application: 'bg-purple-500',
};

const AlertsCard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      // Replace this with actual API call
      const mockAlerts: Alert[] = [
        { 
          id: 1,
          user_id: 101,
          type: 'match', 
          reference_id: 201,
          status: 'unread', 
          created_at: '2024-07-26T10:00:00Z',
          description: 'A new job matching your skills has been posted.',
          actionRequired: false
        },
        { 
          id: 2,
          user_id: 101,
          type: 'invite', 
          reference_id: 301,
          status: 'unread', 
          created_at: '2024-07-25T15:30:00Z',
          description: 'You have been invited for an interview with TechCorp.',
          actionRequired: true
        },
        { 
          id: 3,
          user_id: 101,
          type: 'application', 
          reference_id: 401,
          status: 'read', 
          created_at: '2024-07-24T09:45:00Z',
          description: 'Your application for Software Engineer at InnovateTech has been reviewed.',
          actionRequired: false
        },
        { 
          id: 4,
          user_id: 101,
          type: 'match', 
          reference_id: 202,
          status: 'unread', 
          created_at: '2024-07-23T14:20:00Z',
          description: 'Your profile matches 5 new job openings.',
          actionRequired: false
        },
      ];
      setAlerts(mockAlerts);
    };

    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter(alert => alert.status === 'unread').length;

  const getAlertDotStyle = (alert: Alert) => {
    if (alert.status === 'read') {
      return 'w-2 h-2 rounded-full border border-gray-300';
    }
    return `w-2 h-2 rounded-full ${alertTypeColors[alert.type]}`;
  };

  const filteredAlerts = showOnlyUnread ? alerts.filter(alert => alert.status === 'unread') : alerts;

  const toggleFilter = () => setShowOnlyUnread(!showOnlyUnread);

  const openAlertDialog = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const closeAlertDialog = () => {
    setSelectedAlert(null);
  };

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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      case 'invite':
        return <AlertCircle className="w-6 h-6 text-green-500" />;
      case 'application':
        return <AlertCircle className="w-6 h-6 text-purple-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
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
            <p className="text-sm text-gray-700">{selectedAlert?.description}</p>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm">{selectedAlert?.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">
                {selectedAlert && new Date(selectedAlert.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Reference:</span>
              <span className="text-sm">{selectedAlert?.reference_id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">User ID:</span>
              <span className="text-sm">{selectedAlert?.user_id}</span>
            </div>
          </div>
          {selectedAlert?.actionRequired && (
            <div className="mt-4">
              <Badge variant="destructive" className="w-full justify-center py-1">
                Action Required
              </Badge>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeAlertDialog}>Close</Button>
            {selectedAlert?.actionRequired && (
              <Button onClick={closeAlertDialog}>Take Action</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsCard;