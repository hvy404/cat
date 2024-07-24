import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, ArrowLeft } from "lucide-react";
import useStore from "@/app/state/useStore";
import { getApplicantsDetails } from "@/lib/employer/get-applicant-details";
import ApplicantDetailPanel from './inbound-application-detailed-view';

type AppStatus = 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'accepted';

type Applicant = {
  appId: string;
  submitDate: string;
  appStatus: AppStatus;
  resumeKey: string;
  jobInfo: {
    empId: string;
    positionName: string;
  };
  applicantInfo: {
    applicantId: number;
    contactEmail: string;
  };
};

const statusColors: Record<AppStatus, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
};

const InboundApplicantsSidePanel = () => {
  const { user, setEmployerRightPanelView } = useStore();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (user && user.uuid) {
        setLoading(true);
        try {
          const data = await getApplicantsDetails(user.uuid);
          if (data && Array.isArray(data)) {
            const formattedData = data.map((applicant) => ({
              ...applicant,
              appStatus: applicant.appStatus as AppStatus,
            }));
            setApplicants(formattedData);
          }
        } catch (error) {
          console.error("Error fetching applicants:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplicants();
  }, [user]);

  const capitalizeStatus = (status: AppStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleBack = () => {
    if (selectedApplicationId) {
      setSelectedApplicationId(null);
    } else {
      setEmployerRightPanelView('default');
    }
  };

  const handleApplicantClick = (appId: string) => {
    console.log("Selected application ID:", appId); // Add this log
    setSelectedApplicationId(appId);
  };

  if (selectedApplicationId) {
    return (
      <ApplicantDetailPanel
        applicationId={selectedApplicationId}
        onBack={handleBack}
      />
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Inbound Applicants
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </CardHeader>
      <CardContent className="px-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {applicants.slice(0, 3).map((applicant) => (
              <div
                key={applicant.appId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{applicant.applicantInfo.contactEmail}</h3>
                  <p className="text-sm text-gray-500">{applicant.jobInfo.positionName}</p>
                  <p className="text-xs text-gray-400">Resume Key: {applicant.resumeKey}</p>
                </div>
                <div className="flex items-center">
                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${statusColors[applicant.appStatus]}`}>
                    {capitalizeStatus(applicant.appStatus)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleApplicantClick(applicant.appId)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button className="w-full mt-4">View All Applicants</Button>
      </CardContent>
    </Card>
  );
};

export default InboundApplicantsSidePanel;