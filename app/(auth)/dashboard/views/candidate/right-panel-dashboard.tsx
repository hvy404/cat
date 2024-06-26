import useStore from "@/app/state/useStore";

export default function CandidateDashboardRightPanelDashboard() {
  // get widget state candidateDashboard from  usestore
  const { candidateDashboard } = useStore();

  return <div>{candidateDashboard.widget}</div>;
}
