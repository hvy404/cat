import { create } from "zustand";

interface User {
  email: string;
  uuid: string;
  session: string;
  role: string; // TOOD: this should be an enum of employer-owner, employer-admin, employer-user, talent
}

interface DashboardRoleOverview {
  active: boolean;
  active_role_id: string | null;
  active_role_name: string | null;
  active_role_description: string | null;
  active_role_job_type: string | null;
  active_role_active: boolean | null;
  active_role_private_employer: boolean | null;
  active_role_min_salary: number | null;
  active_role_max_salary: number | null;
  active_role_location_type: string | null;
  active_role_security_clearance: string | null;
  active_role_salary_disclose: boolean | null;
  active_role_commission_pay: boolean | null;
  active_role_commission_percent: number | null;
  active_role_salary_ote: number | null;
}

interface JobLocation {
  city?: string;
  state?: string;
  zipcode?: string;
}

interface JobDetails {
  jobTitle: string;
  location?: JobLocation[];
  location_type: string;
  min_salary?: number | null;
  max_salary?: number | null;
  salary_ote?: number | null;
  commission_percent?: number | null;
  security_clearance: string;
  salary_disclose?: boolean;
  commission_pay?: boolean;
  private_employer?: boolean;
  ote_salary?: number | null;
  compensation_type?: string;
  hourly_comp_min?: number | null;
  hourly_comp_max?: number | null;
}

interface JobDescriptionTitles {
  title: string;
}

interface AddJobDescription {
  filename: string | null;
  jdEntryID: string | null;
  session: string | null;
  isProcessing: boolean;
  isFinalizing: boolean;
  file: File | null;
  step: number;
  jobDetails: JobDetails[]; // Now an array of JobDetails
  jobDescriptionTitles: JobDescriptionTitles[];
  activeField?: string | null; // Store which form field user is currently editing
  publishingRunnerID: string | null; // Ingest runner ID for publishing JD
}

interface JDBuilderWizard {
  step: number;
  sowID: string | null;
  fileUploading: boolean;
  setFileUploading: (value: boolean) => void;
  personnelRoles: {
    roles: string[];
    keyPersonnel: string[];
  };
  setPersonnelRoles: (rolesData: {
    roles: string[];
    keyPersonnel: string[];
  }) => void;
  jobDescriptionId: string | null;
  files: File[]; // This state is for the upload form
  setFiles: (files: File[]) => void; // New setter function for files
  sowFile: string[]; // This state is the filenames after its been uploaded
  setSowFile: (sowFile: string[]) => void;
  fileParsing: boolean; // This state is for the parsing process ie. chunking the file
  setFileParsing: (value: boolean) => void;
  pollingStatus: boolean; // This state is for the polling process
  setPollingStatus: (value: boolean) => void;
  sowParseRunnerID: string | null;
  setSowParseRunnerID: (sowParseRunnerID: string) => void;
  roleToGenerate: string | null; // Store the active role user wants to generate - in Step 3
  setRoleToGenerate: (role: string) => void;
  jdGenerationRunnerID: string | null;
  setJDGenerationRunnerID: (jdGenerationRunnerID: string) => void;
}

interface CandidateDashboard {
  step: number;
  onboardingFormStep: string;
  widget: string;
}

interface StoreState {
  selectedMenuItem: string | null;
  user: User | null;
  addJD: AddJobDescription;
  setSelectedMenuItem: (item: string) => void;
  setUser: (user: User) => void;
  dashboard_role_overview: DashboardRoleOverview;
  setDashboardRoleOverview: (overview: Partial<DashboardRoleOverview>) => void;
  setAddJD: (addJD: Partial<AddJobDescription>) => void;
  updateAddJDStep: (newStep: number) => void;
  isExpanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpansion: () => void;
  jdBuilderWizard: JDBuilderWizard;
  setJDBuilderWizard: (wizard: Partial<JDBuilderWizard>) => void;
  updateJDBuilderWizardStep: (newStep: number) => void;
  candidateDashboard: CandidateDashboard;
  setCandidateDashboard: (dashboard: Partial<CandidateDashboard>) => void;
}

const useStore = create<StoreState>((set) => ({
  // Active menu item in the sidebar
  selectedMenuItem: null,
  // Current user aka employer id
  user: null,
  // Use in Dashboard - Overview page - Set the active role being viewed
  dashboard_role_overview: {
    active: false,
    active_role_id: null,
    active_role_name: null,
    active_role_description: null,
    active_role_job_type: null,
    active_role_active: null,
    active_role_private_employer: null,
    active_role_min_salary: null,
    active_role_max_salary: null,
    active_role_location_type: null,
    active_role_security_clearance: null,
    active_role_salary_disclose: null,
    active_role_commission_pay: null,
    active_role_commission_percent: null,
    active_role_salary_ote: null,
  },
  // State for add-jd
  addJD: {
    filename: null,
    jdEntryID: null,
    session: null,
    isProcessing: false,
    file: null,
    step: 1, // TODO: Change this to 1 after development
    jobDetails: [],
    jobDescriptionTitles: [], // These are alternative job titles generated by the system
    isFinalizing: false,
    publishingRunnerID: null, // Ingest runner ID for publishing JD
  },
  // State for candidate dashboard
  candidateDashboard: {
    step: 1,
    onboardingFormStep: "",
    widget: "",
  },
  // Set candidate dashboard step
  setCandidateDashboard: (dashboard) =>
    set((state) => ({
      candidateDashboard: {
        ...state.candidateDashboard,
        ...dashboard,
      },
    })),
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
  setExpanded: (value) => set((state) => ({ isExpanded: value })),

  // JD Builder Wizard
  jdBuilderWizard: {
    step: 1, // TODO: Change this to 1 after development
    sowID: null,
    jobDescriptionId: null,
    personnelRoles: {
      roles: [],
      keyPersonnel: [],
    },
    setPersonnelRoles: ({
      roles, // stores the detected roles
      keyPersonnel, // stores the detected key personnel roles
    }: {
      roles: string[];
      keyPersonnel: string[];
    }) =>
      set((state) => ({
        jdBuilderWizard: {
          ...state.jdBuilderWizard,
          personnelRoles: { roles, keyPersonnel },
        },
      })),
    files: [],
    setFiles: (files: File[]) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, files },
      })),
    sowFile: [], // TODO: Remove any hardcoded values after development
    setSowFile: (sowFile: string[]) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, sowFile },
      })),
    fileUploading: false,
    setFileUploading: (value: boolean) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, fileUploading: value },
      })),
    fileParsing: false,
    setFileParsing: (value: boolean) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, fileParsing: value },
      })),
    pollingStatus: true, // Set to false after development
    setPollingStatus: (value: boolean) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, pollingStatus: value },
      })),
    sowParseRunnerID: null,
    setSowParseRunnerID: (runnerID: string) =>
      set((state) => ({
        jdBuilderWizard: {
          ...state.jdBuilderWizard,
          sowParseRunnerID: runnerID,
        },
      })),
    roleToGenerate: null,
    setRoleToGenerate: (role: string) =>
      set((state) => ({
        jdBuilderWizard: { ...state.jdBuilderWizard, roleToGenerate: role },
      })),
    jdGenerationRunnerID: null, // Inngest runner ID for generation JD from the wizard
    setJDGenerationRunnerID: (runnerID: string) =>
      set((state) => ({
        jdBuilderWizard: {
          ...state.jdBuilderWizard,
          jdGenerationRunnerID: runnerID,
        },
      })),
  },

  // Set the JD Builder Wizard state
  setJDBuilderWizard: (jdBuilderWizard) =>
    set((state) => ({
      jdBuilderWizard: {
        ...state.jdBuilderWizard,
        ...jdBuilderWizard,
      },
    })),

  // Use this to update the step in the JD Builder Wizard as it will adjust the UI column sizes
  updateJDBuilderWizardStep: (newStep: number) =>
    set((state) => {
      const updates: Partial<StoreState> = {
        jdBuilderWizard: { ...state.jdBuilderWizard, step: newStep },
      };

      if (newStep >= 2) {
        updates.isExpanded = true;
      }

      return updates;
    }),

  // End of store
}));

export default useStore;
