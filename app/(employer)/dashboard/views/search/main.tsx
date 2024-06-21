import useStore from "@/app/state/useStore";
import { useState, useEffect, useRef } from "react";
import {
  CandidateBrowseResults,
  searchResults,
} from "@/app/(employer)/dashboard/views/search/results";
import { searchHandler } from "@/app/(employer)/dashboard/views/search/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchResultsProps {
  searchResults: searchResults[];
  isSearching: boolean;
  resultFound: boolean;
  socket?: boolean;
}

export default function EmployerDashboardCandidateSearch() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();
  // Usestate to store search input value

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<searchResults[]>([]);
  const [resultFound, setResultFound] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  // onclick
  const handleSearch = async () => {
    // if the search input is empty, return
    if (!searchInputRef.current || !searchInputRef.current.value.trim()) {
      // If empty, reset the search state and return early
      setSearchResults([]);
      setResultFound(false);
      setIsSearching(false);
      return;
    }

    setExpanded(false);
    setIsSearching(true);
  
    if (searchResults.length > 0) {
      setSearchResults([]);
    }
  
    const searchInput = searchInputRef.current?.value || "";
    const search = await searchHandler(searchInput);

    console.log("Result", search);
    
    if (search.socket) {
      // Explicit content detected
      setIsSearching(false);
      setResultFound(false);
      setSearchResults([]);
    } else if (search.match && Array.isArray(search.similarTalents) && search.similarTalents.length > 0) {
      // Results found
      setSearchResults(search.similarTalents);
      setResultFound(true);
    } else {
      // No results found for a legitimate search
      setSearchResults([]);
      setResultFound(true);
    }
  
    setIsSearching(false);
  };

  // Enter key
  const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
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
          <div className="rounded-lg">
            <div className="relative">
              <Input
                type="text"
                placeholder="software engineer"
                ref={searchInputRef}
                onFocus={(e) => setExpanded(true)}
                onKeyDown={handleEnterKeyDown}
                className="w-full py-2 pl-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  variant={"link"}
                  size={"icon"}
                  onClick={handleSearch}
                  className="p-1"
                >
                  <Search size={18} className="text-gray-500 hover:text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
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
        />
      </div>
    </main>
  );
}

export function SearchResults({
  searchResults,
  isSearching,
  resultFound,
}: SearchResultsProps) {
  return (
   <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
      {isSearching ? (
        <div className="grid gap-6 h-full">
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <div className="text-center text-gray-400/70 text-2xl font-bold">Searching...</div>
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="grid gap-6 h-full">
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            {resultFound ? (
              <div className="text-center text-gray-400/70 text-2xl font-bold">No matches found.</div>
            ) : (
              <div className="text-center text-gray-400/70 text-2xl font-bold">Enter a role name</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <CandidateBrowseResults searchResults={searchResults} />
        </div>
      )}
    </div>
  );
}