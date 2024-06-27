import useStore from "@/app/state/useStore";
//import WorkExperiences from "@/app/(auth)/dashboard/views/candidate/edit/work-experiences";
//import Education from "@/app/(auth)/dashboard/views/candidate/edit/education";
//import MainProfile from "@/app/(auth)/dashboard/views/candidate/edit/profile";
//import LocationEditor from "@/app/(auth)/dashboard/views/candidate/edit/modal-location";

export function CandidateDashboard() {
  const { candidateDashboard, setCandidateDashboard, user } = useStore();
  const candidateId = user?.uuid;

  return (
    <div className="flex flex-col gap-4">
      {/* Edit  work experieces */}
      <div>
        <div>main dashboard to be built</div>
      </div>
    </div>
  );
}
