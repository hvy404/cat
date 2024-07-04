import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AIMatchCandidateChart from "@/app/(auth)/dashboard/views/overview/mods/match-candidate-peek-chart";
import {
  getTalentNodeNoEmbedding,
  getTalentWorkExperiences,
  getTalentEducation,
  getTalentSkills,
  TalentNode,
  WorkExperienceNode,
  EducationNode,
  SkillNode,
  NodeWithId,
} from "@/lib/candidate/global/mutation";

// TODO: We should add a check to see if employer is allowed to view the resume. we need to store employer<>talent relationship in the database and cross-check it here. Check first before allowing the data to be pull

interface AIMatchCandidateResumeViewProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  applicantId: string;
}

export default function AIMatchCandidateResumeView({
  isOpen,
  setIsOpen,
  applicantId,
}: AIMatchCandidateResumeViewProps) {
  const [talentData, setTalentData] = useState<
    (Omit<TalentNode, "embedding"> & NodeWithId) | null
  >(null);
  const [workExperiences, setWorkExperiences] = useState<
    (WorkExperienceNode & NodeWithId)[]
  >([]);
  const [education, setEducation] = useState<(EducationNode & NodeWithId)[]>(
    []
  );
  const [skills, setSkills] = useState<(SkillNode & NodeWithId)[]>([]);

  const [expandedExperiences, setExpandedExperiences] = useState<Set<number>>(
    new Set()
  ); // Set of indexes of expanded experiences

  useEffect(() => {
    if (isOpen && applicantId) {
      fetchTalentData();
    }
  }, [isOpen, applicantId]);

  const fetchTalentData = async () => {
    try {
      const talent = await getTalentNodeNoEmbedding(applicantId);
      setTalentData(talent);

      const experiences = await getTalentWorkExperiences(applicantId);
      setWorkExperiences(experiences);

      const educationData = await getTalentEducation(applicantId);
      setEducation(educationData);

      const skillsData = await getTalentSkills(applicantId);
      setSkills(skillsData);
    } catch (error) {
      console.error("Error fetching talent data:", error);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedExperiences((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!talentData) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <SheetContent className="md:min-w-[650px] lg:min-w-[800px] overflow-auto">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold leading-7 text-gray-900">
            {talentData.name}
          </SheetTitle>
          <div className="px-4 sm:px-0">
            <Badge variant={"default"}>AI Matched</Badge>
          </div>
        </SheetHeader>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Full name
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {talentData.name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Recent role
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {talentData.title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Email address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {talentData.email}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Skills
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {skills.map((skill) => (
                  <p key={skill._id}>{skill.name}</p>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Education
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 space-y-2">
                {education.map((edu) => (
                  <div key={edu._id}>
                    <p className="font-medium">{edu.degree}</p>
                    <p>{edu.institution}</p>
                    <p>{`${edu.start_date} - ${edu.end_date}`}</p>
                  </div>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Work Experience
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {workExperiences.map((exp, index) => (
                  <div
                    key={exp._id}
                    className={`p-4 rounded-lg ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } ${index !== workExperiences.length - 1 ? "mb-4" : ""}`}
                  >
                    <p className="text-md font-semibold text-gray-900">
                      {exp.job_title}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {exp.organization}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">{`${
                      exp.start_date
                    } - ${exp.end_date || "Present"}`}</p>
                    <div className="text-sm text-gray-700">
                      {expandedExperiences.has(index) ? (
                        <p className="whitespace-pre-line">
                          {exp.responsibilities}
                        </p>
                      ) : (
                        <p>
                          {exp.responsibilities
                            .split(/\s+/)
                            .slice(0, 4)
                            .join(" ")}
                          {exp.responsibilities.split(/\s+/).length > 4
                            ? "..."
                            : ""}
                        </p>
                      )}
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-slate-600 hover:text-slate-800 mt-1 focus:outline-none font-bold"
                      >
                        {expandedExperiences.has(index)
                          ? "Show less"
                          : "Show more"}
                      </button>
                    </div>
                  </div>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Attachments
              </dt>
              <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul
                  role="list"
                  className="divide-y divide-gray-100 rounded-md border border-gray-200"
                >
                  <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip
                        className="h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">resume.pdf</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href="#"
                        className="font-medium text-slate-600 hover:text-slate-500"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <AIMatchCandidateChart />
      </SheetContent>
    </Sheet>
  );
}
