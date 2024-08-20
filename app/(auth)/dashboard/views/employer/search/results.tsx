import React from 'react';
import useStore from "@/app/state/useStore";
import InviteActionWithList from "@/app/(auth)/dashboard/views/employer/search/invite";
import { Badge } from "@/components/ui/badge"; 
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, GraduationCap, Briefcase, Shield, Star } from 'lucide-react';

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
    if (Object.values(selectedFilters).every((filters) => filters.length === 0)) {
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
        filteredIndices = new Set(
          Array.from(filteredIndices).filter((index) => indicesForThisFilter.has(index))
        );
      }
    });

    return Array.from(filteredIndices).map((index) => searchResults[index]);
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="space-y-6">
      {filteredResults.map((result, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-800"
          onClick={expandPanel}
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{result.title}</h2>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {result.score.toFixed(1)}
                    <Star size={12} className="ml-1 fill-current" />
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.clearance_level && result.clearance_level !== "Unclassified" && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center gap-1 px-2 py-1 rounded-full">
                      <Shield size={12} />
                      {result.clearance_level}
                    </Badge>
                  )}
                  {getLocationString(result) && (
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-300 flex items-center gap-1 px-2 py-1 rounded-full">
                      <MapPin size={12} />
                      {getLocationString(result)}
                    </Badge>
                  )}
                </div>
              </div>
              <InviteActionWithList applicantId={result.applicant_id} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.education && result.education.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <GraduationCap size={20} className="text-indigo-500 dark:text-indigo-400" />
                  <div>
                    <p className="font-medium">{result.education[0].degree}</p>
                    <p>{result.education[0].institution}</p>
                  </div>
                </div>
              )}
              {result.previous_role.length > 0 && (
                <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <Briefcase size={20} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">Previous Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {result.previous_role.map((role, roleIndex) => (
                        <Badge key={roleIndex} variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}