/* This the switch that displays the panel for the active state */

import React, { useCallback } from "react";
import useStore, { WidgetPayload } from "@/app/state/useStore";
import DefaultPanel from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/right-panel-default";
import JobMoreDetails from "@/app/(auth)/dashboard/views/candidate/search/job-details";
import G2XTalentIDPanel from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/right-panel-talentId";
import RightPanelResumeSuggestionDetails from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/right-panel-resume-suggestions";
import RightPanelProfileSuggestionDetails from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/right-panel-profile-suggestions";

type WidgetComponentType =
  | ((data: WidgetPayload, clearWidget: () => void) => React.ReactNode)
  | React.ComponentType<{ data: WidgetPayload; clearWidget: () => void }>;

export default function CandidateDashboardRightPanelDashboard() {
  const { candidateDashboard, setCandidateDashboard } = useStore();
  const { widget, widgetPayload } = candidateDashboard;

  const clearWidgetPayload = useCallback(() => {
    setCandidateDashboard({
      widget: "",
      widgetPayload: { type: null, payload: null },
    });
  }, [setCandidateDashboard]);

  const widgetComponents: Record<string, WidgetComponentType> = {
    jobBookmarked: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === "jobBookmarked" && data.payload.jobId) {
        return (
          <JobMoreDetails
            jobId={data.payload.jobId}
            onBack={() => {
              clearWidget();
            }}
          />
        );
      }
      return null;
    },
    inviteAlerts: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === "inviteAlerts" && data.payload.jobId) {
        return (
          <JobMoreDetails
            jobId={data.payload.jobId}
            onBack={() => {
              clearWidget();
            }}
          />
        );
      }
      return null;
    },
    talentID: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === "talentID" && data.payload.show) {
        return (
          <G2XTalentIDPanel
            talentID={data.payload.candidateId}
            onBack={() => {
              clearWidget();
            }}
          />
        );
      }
      return null;
    },
    resumeRecommendation: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === "resumeRecommendation") {
        return (
          <RightPanelResumeSuggestionDetails
            title={data.payload.title}
            message={data.payload.message}
            type={data.payload.type}
            priority={data.payload.priority}
          />
        );
      }
      return null;
    },
    profileRecommendation: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === "profileRecommendation") {
        return (
          <RightPanelProfileSuggestionDetails
            title={data.payload.title}
            message={data.payload.message}
            type={data.payload.type}
            priority={data.payload.priority}
          />
        );
      }
      return null;
    }
  };

  function isWidgetFunction(
    component: WidgetComponentType
  ): component is (
    data: WidgetPayload,
    clearWidget: () => void
  ) => React.ReactNode {
    return typeof component === "function" && component.length > 1;
  }

  const WidgetDetailComponent = widgetComponents[widget];

  if (!WidgetDetailComponent || !widgetPayload) {
    return <DefaultPanel />;
  }

  return (
    <div className="h-full overflow-y-auto">
      {isWidgetFunction(WidgetDetailComponent) ? (
        WidgetDetailComponent(widgetPayload, clearWidgetPayload)
      ) : (
        <WidgetDetailComponent
          data={widgetPayload}
          clearWidget={clearWidgetPayload}
        />
      )}
    </div>
  );
}
