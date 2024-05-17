import { create } from "zustand";

interface User {
  email: string;
  uuid: string;
  session: string;
}

interface DashboardRoleOverview {
  active: boolean;
  active_role_id: string | null;
}

interface JobLocation {
  city: string;
  state: string;
}

interface JobDetails {
  title: string;
  location?: JobLocation[];
  location_type: string;
  min_salary: number;
  max_salary: number;
  security_clearance: string;
}

interface JobDescriptionTitles {
  title: string;
}

interface AddJobDescription {
  filename: string | null;
  jdEntryID: string | null;
  session: string | null;
  isProcessing: boolean;
  file: File | null;
  step: number;
  jobDetails: JobDetails[]; // Now an array of JobDetails
  jobDescriptionTitles: JobDescriptionTitles[];
  activeField?: string | null; // Store which form field user is currently editing
}

interface StoreState {
  selectedMenuItem: string | null;
  user: User | null;
  dashboard_role_overview: DashboardRoleOverview;
  addJD: AddJobDescription;
  setSelectedMenuItem: (item: string) => void;
  setUser: (user: User) => void;
  setDashboardRoleOverview: (overview: Partial<DashboardRoleOverview>) => void;
  setAddJD: (addJD: Partial<AddJobDescription>) => void;
  updateStep: (newStep: number) => void; 
}

const useStore = create<StoreState>((set) => ({
  // Active menu item in the sidebar
  selectedMenuItem: null,
  // Current user aka employer id
  user: null,
  // Use in Dashboard - Overview page - Set the active role being viewed
  dashboard_role_overview: { active: false, active_role_id: null },
  // State for add-jd
  addJD: {
    filename: null,
    jdEntryID: null,
    session: null,
    isProcessing: false,
    file: null,
    step: 2,
    jobDetails: [],
    jobDescriptionTitles: [],
  },
  // Set the active menu item in the sidebar
  setSelectedMenuItem: (item) => set({ selectedMenuItem: item }),
  // Set the current user
  setUser: (user) => set({ user }),
  // Use in Dashboard - Overview page - Set the active role being viewed
  setDashboardRoleOverview: (overview) =>
    set((state) => ({
      dashboard_role_overview: {
        ...state.dashboard_role_overview,
        ...overview,
      },
    })),
  // Set the add-jd state
  setAddJD: (addJD) =>
    set((state) => ({
      addJD: {
        ...state.addJD,
        ...addJD,
      },
    })),

  // Update the step in the add-jd process
  updateStep: (newStep: number) =>
    set((state) => ({
      addJD: { ...state.addJD, step: newStep },
    })),
}));

export default useStore;
