import { Button } from "@/components/ui/button";

export interface searchResults {
  applicant_id: string;
  title: string;
  score: number;
}

export function CandidateBrowseResults({ searchResults }: { searchResults: searchResults[] }) {

  console.log("Search results:", searchResults);
  return (
    <div className="flex flex-col gap-4">
      {searchResults.map((result, index) => (
        <div
          key={index}
          className="flex flex-row w-full items-center gap-2 justify-between rounded-md border border-gray-200/40 hover:bg-gray-100/50 p-4"
        >
          <div className="flex items-center gap-2">
            <div>
              <h2 className="font-medium text-sm">{result.title}</h2>
              <p className="text-xs">Score: {result.score}</p>
            </div>
          </div>
          <div>
            <Button variant={"secondary"}>Invite</Button>
          </div>
        </div>
      ))}
    </div>
  );
}