export interface searchResults {
  applicant_id: string;
  score: number;
}

export function CandidateBrowseResults({ searchResults }: { searchResults: searchResults[] }) {
  return (
    <div className="flex flex-col gap-4">
      {searchResults.map((result, index) => (
        <div
          key={index}
          className="flex flex-row w-full items-center gap-2 justify-between rounded-md bg-gray-100 hover:bg-gray-200/50 p-4"
        >
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-bold">{result.applicant_id}</h3>
              <p>Score: {result.score}</p>
            </div>
          </div>
          <div>
            <button className="p-2 bg-blue-500 text-white rounded">
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}