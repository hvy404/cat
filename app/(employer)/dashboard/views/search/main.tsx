import useStore from "@/app/state/useStore";
import { useState, useEffect, useRef } from "react";
import {
  CandidateBrowseResults,
  searchResults,
  FilterIndex,
} from "@/app/(employer)/dashboard/views/search/results";
import {
  searchHandler,
  SearchResult,
} from "@/app/(employer)/dashboard/views/search/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchResultsProps {
  searchResults: searchResults[];
  isSearching: boolean;
  resultFound: boolean;
  filterIndex: FilterIndex;
  selectedFilters: { [key: string]: string[] };
}

export default function EmployerDashboardCandidateSearch() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<searchResults[]>([]);
  const [resultFound, setResultFound] = useState(false);
  const [filterIndex, setFilterIndex] = useState<FilterIndex>({});
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    location: [],
    // Add more filter types here in the future
  });
  const [overlappingRoles, setOverlappingRoles] = useState<
    Array<{ similar: string; score: number }>
  >([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  const handleSearch = async () => {
    if (!searchInputRef.current || !searchInputRef.current.value.trim()) {
      setSearchResults([]);
      setSelectedFilters({ location: [] }); // Clear the filters
      setResultFound(false);
      setIsSearching(false);
      setFilterIndex({});
      setOverlappingRoles([]);
      return;
    }

    setSelectedFilters({ location: [] }); // Clear the filters
    setExpanded(false);
    setIsSearching(true);

    const searchInput = searchInputRef.current?.value || "";
    const search: SearchResult | { socket: boolean } = await searchHandler(
      searchInput
    );

    console.log("Results", search);

    if ("socket" in search && search.socket) {
      setIsSearching(false);
      setResultFound(false);
      setSearchResults([]);
      setFilterIndex({});
      setOverlappingRoles([]);
    } else if (
      "match" in search &&
      search.match &&
      Array.isArray(search.similarTalents) &&
      search.similarTalents.length > 0
    ) {
      setSearchResults(search.similarTalents);
      setResultFound(true);
      setFilterIndex(createFilterIndex(search.similarTalents));

      // Set overlappingRoles if present
      if (
        "overlappingRoles" in search &&
        Array.isArray(search.overlappingRoles)
      ) {
        setOverlappingRoles(search.overlappingRoles);
      } else {
        setOverlappingRoles([]);
      }
    } else {
      setSearchResults([]);
      setResultFound("match" in search ? search.match : false);
      setFilterIndex({});
      setOverlappingRoles([]);
    }

    setIsSearching(false);
  };

  const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const toggleFilter = (filterType: string, value: string) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (filter) => filter !== value
        );
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], value];
      }
      return updatedFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters((prevFilters) => {
      const clearedFilters: { [key: string]: string[] } = {};
      Object.keys(prevFilters).forEach((key) => {
        clearedFilters[key] = [];
      });
      return clearedFilters;
    });
  };

  const createFilterIndex = (results: searchResults[]): FilterIndex => {
    const index: FilterIndex = {
      location: {},
      // Add more filter types here in the future
    };

    results.forEach((result, i) => {
      const location = getLocationString(result);
      if (!index.location[location]) {
        index.location[location] = new Set();
      }
      index.location[location].add(i);

      // Add more filter types here in the future
    });

    return index;
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

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-2/4" : "lg:w-1/4"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">Search</h2>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg relative">
            <Input
              type="text"
              placeholder="software engineer"
              ref={searchInputRef}
              onFocus={(e) => setExpanded(true)}
              onKeyDown={handleEnterKeyDown}
              className="w-full py-2 pl-4 pr-10 text-gray-900 font-semibold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button
                variant={"link"}
                size={"icon"}
                onClick={handleSearch}
                className="p-1"
              >
                <Search
                  size={18}
                  className="text-gray-500 hover:text-gray-400"
                />
              </Button>
            </div>
          </div>
        </div>
        <div>
          {searchResults.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Locations</h3>
                {selectedFilters.location.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-slate-500 hover:text-slate-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(filterIndex.location || {}).map(
                  (location, index) => (
                    <span
                      key={index}
                      onClick={() => toggleFilter("location", location)}
                      className={`px-2 py-1 rounded-md text-xs cursor-pointer ${
                        selectedFilters.location.includes(location)
                          ? "bg-slate-500 text-white"
                          : "bg-gray-100/50 hover:bg-gray-100"
                      }`}
                    >
                      {location}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        {overlappingRoles.length > 0 && (
          <div className="mt-4 border border-gray-800 rounded-md p-4 bg-black text-green-400 font-mono shadow-lg relative overflow-hidden scanline">
            <h3 className="text-lg font-semibold mb-3 text-green-500 cursor-blink">
              Eagle Eye Terminal_
            </h3>
            <p className="text-green-400 font-mono text-sm mb-2">
              Among the candidates that match your search, the following roles
              were found to be shared by multiple candidates.
            </p>
            <p className="text-green-400 font-mono text-sm mb-4">
              The scores represent each role's alignment with the role you
              searched for.
            </p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900">
              {overlappingRoles.map((role, index) => (
                <div
                  key={index}
                  className="border border-green-700 p-3 rounded"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{role.similar}</span>
                    <span className="text-sm">
                      Score: {(role.score * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-green-900 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${role.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-2/4" : "lg:w-3/4"
        }`}
      >
        <SearchResults
          searchResults={searchResults}
          isSearching={isSearching}
          resultFound={resultFound}
          filterIndex={filterIndex}
          selectedFilters={selectedFilters}
        />
      </div>
    </main>
  );
}

export function SearchResults({
  searchResults,
  isSearching,
  resultFound,
  filterIndex,
  selectedFilters,
}: SearchResultsProps) {
  return (
    <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
      {isSearching ? (
        <div className="grid gap-6 h-full">
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <div className="text-center text-gray-400/70 text-2xl font-bold">
              Searching
              <span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="grid gap-6 h-full">
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            {resultFound ? (
              <div className="text-center text-gray-400/70 text-2xl font-bold">
                No matches found.
              </div>
            ) : (
              <div className="text-center text-gray-400/70 text-2xl font-bold">
                Enter a role name
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <CandidateBrowseResults
            searchResults={searchResults}
            filterIndex={filterIndex}
            selectedFilters={selectedFilters}
          />
        </div>
      )}
    </div>
  );
}
