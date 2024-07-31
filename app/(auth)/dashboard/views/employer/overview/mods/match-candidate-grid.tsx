import { useState } from "react";
import AIMatchCandidateResumeView from "@/app/(auth)/dashboard/views/employer/overview/mods/match-candidate-peek";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Candidate {
  id: string;
  name: string;
  role: string;
  location: string;
  matchingScore: number;
  keyResponsibilitiesMatch: string[];
  experienceLevel: string;
  educationLevel: string;
  recentJobTitles: string[];
  availability: string;
  candidateSummary: string;
}

const candidates = [
  {
    id: "1",
    name: "Jane Doe",
    role: "Software Engineer",
    location: "Atlanta, GA",
    matchingScore: 87,
    keyResponsibilitiesMatch: [
      "Developing software solutions",
      "Collaborating with cross-functional teams",
    ],
    experienceLevel: "5 years",
    educationLevel: "Bachelor's Degree in Computer Science",
    recentJobTitles: ["Senior Software Engineer", "Software Developer"],
    availability: "2 weeks",
    candidateSummary:
      "Experienced Software Engineer with a strong background in developing robust software solutions and working effectively in team environments.",
  },
  {
    id: "2",
    name: "Jane Doe",
    role: "Software Engineer",
    location: "New York City, NY",
    matchingScore: 32,
    keyResponsibilitiesMatch: [
      "Designing and implementing software",
      "Maintaining and improving code quality",
    ],
    experienceLevel: "6 years",
    educationLevel: "Master's Degree in Computer Science",
    recentJobTitles: ["Lead Software Engineer", "Software Engineer"],
    availability: "1 month",
    candidateSummary:
      "Proficient Software Engineer with extensive experience in software design and implementation, and a proven track record of leading successful projects.",
  }
];

interface CircularProgressProps {
  value: number;
}

export const CircularProgress = ({ value }: CircularProgressProps) => {
  const getColor = (value: number) => {
    if (value <= 10) return "#FFCDD2"; // Red 100
    if (value <= 20) return "#EF9A9A"; // Red 200
    if (value <= 30) return "#E57373"; // Red 300
    if (value <= 40) return "#EF5350"; // Red 400
    if (value <= 50) return "#FFEB3B"; // Yellow 400
    if (value <= 60) return "#FFF176"; // Yellow 300
    if (value <= 70) return "#DCE775"; // Lime 300
    if (value <= 80) return "#AED581"; // Green 300
    if (value <= 90) return "#81C784"; // Green 400
    return "#66BB6A"; // Green 500
  };

  const percentage = Math.min(Math.max(value, 0), 100);
  const strokeColor = getColor(percentage);
  const radius = 20; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        className="transform -rotate-90"
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#f0f0f0"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke={strokeColor}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-stroke-dashoffset duration-300"
        />
      </svg>
      <span className="absolute text-xs font-bold">{percentage}%</span>
    </div>
  );
};

export default function AIMatchCandidateOverview() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );

  const handleOpenResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate.name);
    setIsOpen(true);
  };

  return (
    <>
      {candidates.map((candidate, index) => (
        <Card key={index} onClick={() => handleOpenResume(candidate)} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {candidate.name}
            </CardTitle>
            <CircularProgress value={candidate.matchingScore} />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{candidate.location}</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              {candidate.keyResponsibilitiesMatch.join(", ")}
            </p>
          </CardContent>
        </Card>
      ))}
      <AIMatchCandidateResumeView
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        /* applicantId={selectedCandidate || ""} */
        applicantId={"a4004387-b3af-4b03-8d44-4109c5e4a143"}
      />
    </>
  );
}
