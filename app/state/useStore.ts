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
  salary_ote?: number;
  commission_percent?: number;
  security_clearance: string;
  salary_disclose?: boolean;
  commission_pay?: boolean;
  private_employer?: boolean;
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

interface JDBuilderWizard {
  step: number;
  sowID: string | null;
  personnelRoles: string[];
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
  updateAddJDStep: (newStep: number) => void;
  isExpanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpansion: () => void;
  jdBuilderWizard: JDBuilderWizard;
  setJDBuilderWizard: (wizard: Partial<JDBuilderWizard>) => void;
  updateJDBuilderWizardStep: (newStep: number) => void;
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
  updateAddJDStep: (newStep: number) =>
    set((state) => ({
      addJD: { ...state.addJD, step: newStep },
    })),

  // State for the expansion panel
  isExpanded: false,
  toggleExpansion: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (value: boolean) => set({ isExpanded: value }),

  // JD Builder Wizard
  jdBuilderWizard: {
    step: 1,
    sowID: null,
    personnelRoles: [],
  },

  // Set the JD Builder Wizard state
  setJDBuilderWizard: (jdBuilderWizard) =>
    set((state) => ({
      jdBuilderWizard: {
        ...state.jdBuilderWizard,
        ...jdBuilderWizard,
      },
    })),

  // Update the step in the JD Builder Wizard
  updateJDBuilderWizardStep: (newStep: number) =>
    set((state) => ({
      jdBuilderWizard: { ...state.jdBuilderWizard, step: newStep, personnelRoles: []},
    }),
  ),

  // End of store
}));

export default useStore;
