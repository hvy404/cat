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

interface StoreState {
  selectedMenuItem: string | null;
  user: User | null;
  dashboard_role_overview: DashboardRoleOverview;
  setSelectedMenuItem: (item: string) => void;
  setUser: (user: User) => void;
  setDashboardRoleOverview: (overview: Partial<DashboardRoleOverview>) => void;
}

const useStore = create<StoreState>((set) => ({
  // Active menu item in the sidebar
  selectedMenuItem: null,
  // Current user
  user: null,
  // Use in Dashboard - Overview page - Set the active role being viewed
  dashboard_role_overview: { active: false, active_role_id: null },
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
}));

export default useStore;
