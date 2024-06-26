import useStore from "@/app/state/useStore";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy } from "lucide-react";
import {
  getTalentRelationshipTypes,
  getTalentWorkExperiences,
  getTalentSkills,
  getTalentCertifications,
  getTalentIndustryExperiences,
  getTalentPotentialRoles,
  getTalentSoftSkills,
  updateNodeProperty,
  WorkExperienceNode,
  NodeWithId,
  SkillNode,
  CertificationNode,
  IndustryNode,
  RoleNode,
  SoftSkillNode,
} from "@/lib/candidate/dashboard/mutation";
import WorkExperiences from "@/app/(auth)/dashboard/views/candidate/edit/work-experiences";
import Education from "@/app/(auth)/dashboard/views/candidate/edit/education";

export function CandidateDashboard() {
  const { candidateDashboard, setCandidateDashboard, user } = useStore();
  const candidateId = user?.uuid;

  return (
    <div className="flex flex-col gap-4">
      {/* Edit  work experieces */}
      <div>
        <div>
          <Education />
        </div>
      </div>
    </div>
  );
}
