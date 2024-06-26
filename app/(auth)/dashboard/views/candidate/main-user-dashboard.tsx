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

export function CandidateDashboard() {
  const { candidateDashboard, setCandidateDashboard, user } = useStore();
  const [updateStatus, setUpdateStatus] = useState("");
  const [nodeIdToUpdate, setNodeIdToUpdate] = useState("");
  const [workExperiences, setWorkExperiences] = useState<(WorkExperienceNode & NodeWithId)[]>([]);
  const [skills, setSkills] = useState<(SkillNode & NodeWithId)[]>([]);
  const [certifications, setCertifications] = useState<(CertificationNode & NodeWithId)[]>([]);
  const [industryExperiences, setIndustryExperiences] = useState<(IndustryNode & NodeWithId)[]>([]);
  const [potentialRoles, setPotentialRoles] = useState<(RoleNode & NodeWithId)[]>([]);
  const [softSkills, setSoftSkills] = useState<(SoftSkillNode & NodeWithId)[]>([]);

  const candidateId = user?.uuid;

  const onClick = () => {
    setCandidateDashboard({ widget: "Test 1" });
  };

  const onClickGetTalentRelationshipTypes = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const relationshipTypes = await getTalentRelationshipTypes({
        talentId: candidateId,
      });
      console.log(relationshipTypes);
      setUpdateStatus(`Retrieved relationship types: ${relationshipTypes.join(", ")}`);
    } catch (error) {
      console.error("Error getting relationship types:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentWorkExperiences = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentWorkExperiences(candidateId);
      setWorkExperiences(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} work experience nodes`);
    } catch (error) {
      console.error("Error getting work experience nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentSkills = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentSkills(candidateId);
      setSkills(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} skill nodes`);
    } catch (error) {
      console.error("Error getting skill nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentCertifications = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentCertifications(candidateId);
      setCertifications(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} certification nodes`);
    } catch (error) {
      console.error("Error getting certification nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentIndustryExperiences = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentIndustryExperiences(candidateId);
      setIndustryExperiences(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} industry experience nodes`);
    } catch (error) {
      console.error("Error getting industry experience nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentPotentialRoles = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentPotentialRoles(candidateId);
      setPotentialRoles(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} potential role nodes`);
    } catch (error) {
      console.error("Error getting potential role nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickGetTalentSoftSkills = async () => {
    if (!candidateId) {
      setUpdateStatus("No candidate ID available");
      return;
    }
    try {
      const nodes = await getTalentSoftSkills(candidateId);
      setSoftSkills(nodes);
      console.log(nodes);
      setUpdateStatus(`Retrieved ${nodes.length} soft skill nodes`);
    } catch (error) {
      console.error("Error getting soft skill nodes:", error);
      setUpdateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onClickTestWrite = async () => {
    // ... (keep the existing onClickTestWrite function)
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ... (keep the existing card components) ... */}
      <div className="flex flex-col gap-2">
        <button onClick={onClickGetTalentRelationshipTypes} className="p-2 bg-blue-500 text-white rounded">
          Get Talent Relationship Types
        </button>
        <button onClick={onClickGetTalentWorkExperiences} className="p-2 bg-green-500 text-white rounded">
          Get Talent Work Experiences
        </button>
        <button onClick={onClickGetTalentSkills} className="p-2 bg-yellow-500 text-white rounded">
          Get Talent Skills
        </button>
        <button onClick={onClickGetTalentCertifications} className="p-2 bg-purple-500 text-white rounded">
          Get Talent Certifications
        </button>
        <button onClick={onClickGetTalentIndustryExperiences} className="p-2 bg-indigo-500 text-white rounded">
          Get Talent Industry Experiences
        </button>
        <button onClick={onClickGetTalentPotentialRoles} className="p-2 bg-pink-500 text-white rounded">
          Get Talent Potential Roles
        </button>
        <button onClick={onClickGetTalentSoftSkills} className="p-2 bg-teal-500 text-white rounded">
          Get Talent Soft Skills
        </button>
        <div className="flex gap-2">
          <input
            type="number"
            value={nodeIdToUpdate}
            onChange={(e) => setNodeIdToUpdate(e.target.value)}
            placeholder="Enter node ID to update"
            className="p-2 border rounded"
          />
          <button onClick={onClickTestWrite} className="p-2 bg-red-500 text-white rounded">
            Test Write (Update Job Title)
          </button>
        </div>
        {updateStatus && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            Status: {updateStatus}
          </div>
        )}
        {workExperiences.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Work Experience Nodes:</h3>
            <ul className="list-disc pl-5">
              {workExperiences.map((node) => (
                <li key={node._id}>
                  ID: {node._id}, Job Title: {node.job_title}, Organization: {node.organization}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Add similar sections for other node types (skills, certifications, etc.) */}
      </div>
    </div>
  );
}