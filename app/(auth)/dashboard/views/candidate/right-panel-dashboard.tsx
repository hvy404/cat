import React from "react";
import useStore, { WidgetPayload } from "@/app/state/useStore";
//import { JobBookmarkedDetail } from './widget-details/JobBookmarkedDetail';
//import { JobInvitedDetail } from './widget-details/JobInvitedDetail';
//import { ResumeRecommendationsDetail } from './widget-details/ResumeRecommendationsDetail';
//import { ProfileEnhancementsDetail } from './widget-details/ProfileEnhancementsDetail';
//import { InsightsDetail } from './widget-details/InsightsDetail';

interface WidgetProps {
  data: WidgetPayload;
}

//mock JobBookmarkedDetail
const JobBookmarkedDetail: React.FC<WidgetProps> = ({ data }) => (
  <div>
    <h3>Job Bookmarked</h3>
    <p>Job Bookmarked Detail</p>
    {data.type === "jobBookmarked" && <p>Job ID: {data.payload.jobId}</p>}
  </div>
);

const widgetComponents = {
  jobBookmarked: JobBookmarkedDetail,
  //jobInvited: JobInvitedDetail,
  //resumeRecommendations: ResumeRecommendationsDetail,
  //profileEnhancements: ProfileEnhancementsDetail,
  //insights: InsightsDetail,
};

export default function CandidateDashboardRightPanelDashboard() {
  const { candidateDashboard } = useStore();
  const { widget, widgetPayload } = candidateDashboard;

  const WidgetDetailComponent =
    widgetComponents[widget as keyof typeof widgetComponents];

  if (!WidgetDetailComponent || !widgetPayload) {
    return <p>Select a widget to view more details</p>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Detailed View</h2>
      <WidgetDetailComponent data={widgetPayload} />
    </div>
  );
}
