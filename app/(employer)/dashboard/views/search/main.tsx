import useStore from "@/app/state/useStore";
import { useState, useEffect } from "react";
import {
  CandidateBrowseResults,
  searchResults,
} from "@/app/(employer)/dashboard/views/search/results";
import { searchHandler } from "@/app/(employer)/dashboard/views/search/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function EmployerDashboardCandidateSearch() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();
  // Usestate to store search input value
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<searchResults[]>([]);

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  // onclick
  const handleClick = async () => {
    setExpanded(false);

    if (searchResults.length > 0) {
      setSearchResults([]);
    }

    const search = await searchHandler(searchInput);
    setSearchResults(search.similarTalents);
  };

  // Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleClick();
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={(e) => setExpanded(true)}
                onKeyDown={handleKeyDown}
                className="w-full py-2 pl-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  variant={"link"}
                  size={"icon"}
                  onClick={handleClick}
                  disabled={searchInput.length === 0}
                  className="p-1"
                >
                  <Search size={18} className="text-gray-500" />
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
        onMouseOver={() => setExpanded(false)}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          <div className="grid gap-6">
            <CandidateBrowseResults searchResults={searchResults} />
          </div>
        </div>
      </div>
    </main>
  );
}
