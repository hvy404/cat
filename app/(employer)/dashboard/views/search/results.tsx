import useStore from "@/app/state/useStore";
import InviteActionWithList from "@/app/(employer)/dashboard/views/search/invite";

export interface searchResults {
  applicant_id: string;
  title: string;
  score: number;
  clearance_level: string;
  previous_role: string[];
  education: Array<{ degree: string; institution: string }>;
  city: string;
  state: string;
  zipcode: string;
}

export interface FilterIndex {
  [key: string]: {
    [value: string]: Set<number>;
  };
}

export function CandidateBrowseResults({
  searchResults,
  filterIndex,
  selectedFilters,
}: {
  searchResults: searchResults[];
  filterIndex: FilterIndex;
  selectedFilters: { [key: string]: string[] };
}) {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  const expandPanel = () => {
    setExpanded(false);
  };

  const getLocationString = (result: searchResults) => {
    const city = result.city || "";
    const state = result.state || "";
    const zipcode = result.zipcode || "";

    if (city && state && zipcode) {
      return `${city}, ${state} ${zipcode}`;
    } else if (city && state) {
      return `${city}, ${state}`;
    } else if (city && zipcode) {
      return `${city} ${zipcode}`;
    } else if (state && zipcode) {
      return `${state} ${zipcode}`;
    } else {
      return city || state || zipcode;
    }
  };

  const getFilteredResults = () => {
    if (
      Object.values(selectedFilters).every((filters) => filters.length === 0)
    ) {
      return searchResults;
    }

    let filteredIndices = new Set<number>();
    let isFirstFilter = true;

    Object.entries(selectedFilters).forEach(([filterType, selectedValues]) => {
      if (selectedValues.length === 0) return;

      const indicesForThisFilter = new Set<number>();
      selectedValues.forEach((value) => {
        const indices = filterIndex[filterType]?.[value] || new Set();
        Array.from(indices).forEach((index) => indicesForThisFilter.add(index));
      });

      if (isFirstFilter) {
        filteredIndices = indicesForThisFilter;
        isFirstFilter = false;
      } else {
        // Intersection with previous filters
        filteredIndices = new Set(
          Array.from(filteredIndices).filter((index) =>
            indicesForThisFilter.has(index)
          )
        );
      }
    });

    return Array.from(filteredIndices).map((index) => searchResults[index]);
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="flex flex-col gap-4">
      {filteredResults.map((result, index) => (
        <div
          key={index}
          onClick={expandPanel}
          className="flex flex-row w-full items-center gap-2 justify-between rounded-md border border-gray-200/40 hover:bg-gray-100/50 hover:border-2 hover:border-slate-800 p-4"
        >
          {/* Left */}
          <div className="flex items-center">
            <div>
              <h2 className="font-medium text-sm">{result.title}</h2>
              <div className="flex flex-row flex-wrap gap-2 text-xs py-2">
                {result.clearance_level &&
                  result.clearance_level !== "Unclassified" && (
                    <div className="border rounded-lg border-gray-200/40 px-2 py-1">
                      <span className="font-medium">Clearance:</span>{" "}
                      <p className="text-gray-700">{result.clearance_level}</p>
                    </div>
                  )}
                <div className="border rounded-lg border-gray-200/40 px-2 py-1">
                  <span className="font-medium">Location:</span>{" "}
                  <p className="text-gray-700">{getLocationString(result)}</p>
                </div>
                {result.education && result.education.length > 0 && (
                  <div className="border rounded-lg border-gray-200/40 px-2 py-1">
                    <span className="font-medium">Education:</span>{" "}
                    <p className="text-gray-700">
                      {" "}
                      {result.education[0].degree} -{" "}
                      {result.education[0].institution}{" "}
                    </p>
                  </div>
                )}
                {result.previous_role.length > 0 && (
                  <div className="border rounded-lg border-gray-200/40 px-2 py-1 max-w-full">
                    <span className="font-medium">Previous experience:</span>{" "}
                    <p className="inline-flex items-center flex-wrap leading-5 py-1">
                      {result.previous_role.map((role, roleIndex) => (
                        <span
                          key={roleIndex}
                          className="flex items-center whitespace-nowrap text-gray-700"
                        >
                          {role}
                          {roleIndex < result.previous_role.length - 1 && (
                            <span className="mx-2 h-3 w-px bg-gray-300"></span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right */}
          <div className="flex flex-col h-full items-start justify-start">
          <InviteActionWithList applicantId={result.applicant_id} />
          </div>
        </div>
      ))}
    </div>
  );
}
