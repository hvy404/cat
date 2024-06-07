import useStore from "@/app/state/useStore";
import RichInput from "@/app/(employer)/dashboard/views/profile/editor/input";

export default function EmployerDashboardDocuments() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-auto h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">Section Title</h2>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <RichInput />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          <div className="grid gap-6">Right Column</div>
        </div>
      </div>
    </main>
  );
}
