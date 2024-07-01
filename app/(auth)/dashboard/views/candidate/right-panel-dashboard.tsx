import React, { useCallback } from "react";
import useStore, { WidgetPayload } from "@/app/state/useStore";
import JobMoreDetails from "@/app/(auth)/dashboard/views/candidate/search/job-details";

type WidgetComponentType = 
  | ((data: WidgetPayload, clearWidget: () => void) => React.ReactNode)
  | React.ComponentType<{ data: WidgetPayload; clearWidget: () => void }>;

export default function CandidateDashboardRightPanelDashboard() {
  const { candidateDashboard, setCandidateDashboard } = useStore();
  const { widget, widgetPayload } = candidateDashboard;

  const clearWidgetPayload = useCallback(() => {
    setCandidateDashboard({
      widget: "",
      widgetPayload: { type: null, payload: null }
    });
  }, [setCandidateDashboard]);

  const widgetComponents: Record<string, WidgetComponentType> = {
    jobBookmarked: (data: WidgetPayload, clearWidget: () => void) => {
      if (data.type === 'jobBookmarked' && data.payload.jobId) {
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
    // Add other widget components here as needed
  };

  function isWidgetFunction(
    component: WidgetComponentType
  ): component is (data: WidgetPayload, clearWidget: () => void) => React.ReactNode {
    return typeof component === 'function' && component.length > 1;
  }

  const WidgetDetailComponent = widgetComponents[widget];

  if (!WidgetDetailComponent || !widgetPayload) {
    return <p className="p-4">Need to build a default panel</p>;
  }

  return (
    <div className="h-full overflow-y-auto">
      {isWidgetFunction(WidgetDetailComponent)
        ? WidgetDetailComponent(widgetPayload, clearWidgetPayload)
        : <WidgetDetailComponent data={widgetPayload} clearWidget={clearWidgetPayload} />
      }
    </div>
  );
}