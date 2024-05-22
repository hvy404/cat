import useStore from "@/app/state/useStore";
import { useEffect } from "react";

export default function EmployerDashboardJDBuilder() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  // Reset expanded state when component unmounts
  useEffect(() => {
      return () => {
          setExpanded(false); 
      };
  }, [setExpanded]);


    return (
        <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
            <div className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${isExpanded ? 'lg:w-3/4' : 'lg:w-1/2'}`}>
                <div className="flex justify-between gap-6 rounded-lg border p-4">
                    <h2 className="font-bold leading-6 text-gray-900">Section Title</h2>
                    <div>Search box</div>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">Header</div>
                    </div>
                    <button onClick={toggleExpansion} className="p-2 bg-blue-500 text-white rounded">
                        Toggle Expand
                    </button>
                </div>
            </div>
            <div className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${isExpanded ? 'lg:w-1/4' : 'lg:w-1/2'}`}>
                <div className="min-h-[50vh] rounded-xl bg-muted/50 p-4 overflow-auto">
                    <div className="grid gap-6">Right Column</div>
                </div>
            </div>
        </main>
    );
}
