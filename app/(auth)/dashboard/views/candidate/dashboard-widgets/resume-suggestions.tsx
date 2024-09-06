import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, ChevronRight } from "lucide-react";
import {
  FetchResumeEnhancements,
  ResumeSuggestion,
} from "@/lib/dashboard/candidate/resume-enhancements/build-suggestions";

interface ResumeSuggestionCardProps {
  candidateId: string;
  handleResumeSuggestionClick: (suggestion: ResumeSuggestion) => void;
}

export default function ResumeSuggestionCard({
  candidateId,
  handleResumeSuggestionClick
}: ResumeSuggestionCardProps) {
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const result = await FetchResumeEnhancements(candidateId);
      setSuggestions(result);
      setLoading(false);
    };

    fetchSuggestions();
  }, [candidateId]);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "before:bg-red-500";
      case "medium":
        return "before:bg-yellow-500";
      case "low":
        return "before:bg-green-500";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
      <div className="flex items-center">
        <Lightbulb className="w-4 h-4 text-yellow-400 mr-2" />
        <CardTitle className="text-md font-semibold text-gray-800">
          Story Enhancements
        </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow py-4 space-y-2">
        {loading ? (
          <p className="text-gray-500 text-sm text-center">Loading suggestions...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            Your resume is looking great!
          </p>
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-r-lg transition-colors duration-200 relative overflow-hidden ${getPriorityClass(
                suggestion.priority
              )} before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1`}
              onClick={() => handleResumeSuggestionClick(suggestion)}
            >
              <span className="text-sm font-medium text-gray-700 text-left">
                {suggestion.title}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}