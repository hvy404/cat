"use client";
import useStore from "@/app/state/useStore"; // Using the correct import path

/**
 * Clears the dashboard widget panel by setting the candidate dashboard state.
 * This resets the right panel back to its default state.
 */
export const clearDashboardWidgetPanel = () => {
  const { setCandidateDashboard } = useStore.getState();
  setCandidateDashboard({
    widget: "",
    widgetPayload: { type: null, payload: null },
  });
};
