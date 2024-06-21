import { Button } from "@/components/ui/button";
import useStore from "@/app/state/useStore";
import InviteActionWithList from "@/app/(employer)/dashboard/views/search/invite";

export interface searchResults {
  applicant_id: string;
  title: string;
  score: number;
}

export function CandidateBrowseResults({
  searchResults,
}: {
  searchResults: searchResults[];
}) {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  const expandPanel = () => {
    setExpanded(false);
  };

  console.log(searchResults);
  return (
    <div className="flex flex-col gap-4">
      {searchResults.map((result, index) => (
        <div
          key={index}
          onClick={expandPanel}
          className="flex flex-row w-full items-center gap-2 justify-between rounded-md border border-gray-200/40 hover:bg-gray-100/50 hover:border-2 hover:border-indigo-800 p-4"
        >
          {/* Left */}
          <div className="flex items-center">
            <div>
              <h2 className="font-medium text-sm">{result.title}</h2>
              <div className="flex flex-row gap-2 text-xs py-2">
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  <span className="font-medium">Clearance</span>: Secret
                </div>
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  Atlanta, GA
                </div>
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  Bachelors, University of Georgia
                </div>
              </div>
              <div className="flex flex-row gap-2 text-xs py-2">
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  <span className="font-medium">Experience:</span> Role 1,
                  2020-2021 | Role 2, 2021-2022
                </div>
              </div>
            </div>
          </div>
          {/* Right */}
          <div className="flex flex-col items-start justify-start h-full">
            <InviteActionWithList />
          </div>
        </div>
      ))}
    </div>
  );
}
