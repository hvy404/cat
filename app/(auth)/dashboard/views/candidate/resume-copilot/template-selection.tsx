import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { layouts, LayoutConfig } from "./templates/docx-template";
import { ResumeData, ResumeItem } from "./assemble-docx";

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: string) => void;
  resumeData: ResumeData;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  onSelectTemplate,
  resumeData,
}) => {
  const templates = Object.entries(layouts)
    .filter(([name]) => name !== "minimalistTimeline")
    .map(([name, layout]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      component: <TemplateChosen layout={layout} resumeData={resumeData} />,
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Select a Resume Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.name} className="flex flex-col items-center">
              <div className="w-full h-[200px] overflow-hidden relative mb-2 border border-gray-300 rounded">
                <div className="transform scale-[0.6] origin-top-left w-[166%] h-[166%] p-8">
                  {template.component}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
              </div>
              <Button
                onClick={() => onSelectTemplate(template.name.toLowerCase())}
                variant="default"
                className="w-full"
              >
                {template.name}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TemplateChosen: React.FC<{
    layout: LayoutConfig;
    resumeData: ResumeData;
  }> = ({ layout, resumeData }) => {
    const personalInfo = resumeData.reduce((acc, item) => {
      if (item.type === "personal" && typeof item.content.key === 'string') {
        return { ...acc, [item.content.key]: item.content.value };
      }
      return acc;
    }, {} as Record<string, string | undefined>);
  
    const experiences = resumeData.filter(
      (item): item is ResumeItem => item.type === "experience"
    );
    const educations = resumeData.filter(
      (item): item is ResumeItem => item.type === "education"
    );
    const skills = resumeData.filter(
      (item): item is ResumeItem => item.type === "skills"
    );
  
    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    };
  
    return (
        <div
        className="bg-white w-full h-full text-black"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div
          className={`mb-6 ${
            layout.alignments.header === "center" ? "text-center" : ""
          }`}
        >
          <h1
            className={`text-[${layout.fontSizes.name}px] ${
              layout.fontStyles.name.bold ? "font-bold" : ""
            } ${layout.fontStyles.name.italics ? "italic" : ""}`}
          >
            {personalInfo.name || ""}
          </h1>
          {personalInfo.title && (
            <p
              className={`text-[${layout.fontSizes.title}px] ${
                layout.fontStyles.title.bold ? "font-bold" : ""
              } ${layout.fontStyles.title.italics ? "italic" : ""}`}
            >
              {personalInfo.title}
            </p>
          )}
          <p className={`text-[${layout.fontSizes.contactInfo}px]`}>
            {[
              personalInfo.email,
              personalInfo.phone,
              personalInfo.clearance_level && `Clearance: ${personalInfo.clearance_level}`,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
          <p className={`text-[${layout.fontSizes.contactInfo}px]`}>
            {[
              personalInfo.city,
              personalInfo.state,
              personalInfo.zipcode
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
  
        {layout.useThematicBreak && <hr className="mb-4" />}
  
        {/* Experience Section */}
        <div
          className={`mb-6 ${
            layout.alignments.sectionHeading === "center" ? "text-center" : ""
          }`}
        >
          <h2
            className={`text-[${layout.fontSizes.sectionHeading}px] ${
              layout.fontStyles.sectionHeading.bold ? "font-bold" : ""
            } ${layout.fontStyles.sectionHeading.italics ? "italic" : ""} mb-2`}
          >
            Experience
          </h2>
          {experiences.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className={`text-[${layout.fontSizes.normal}px] font-semibold`}>
                {exp.content.job_title}
              </h3>
              <p className={`text-[${layout.fontSizes.normal}px] italic`}>
                {exp.content.organization}
              </p>
              <p className={`text-[${layout.fontSizes.normal - 2}px]`}>
                {formatDate(exp.content.start_date)} - {formatDate(exp.content.end_date)}
              </p>
              <ul className="list-disc list-inside">
                {exp.content.responsibilities?.split("\n").slice(0, 2).map((resp, i) => (
                  <li key={i} className={`text-[${layout.fontSizes.normal - 2}px]`}>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
  
        {/* Education Section */}
        <div
          className={`mb-6 ${
            layout.alignments.sectionHeading === "center" ? "text-center" : ""
          }`}
        >
          <h2
            className={`text-[${layout.fontSizes.sectionHeading}px] ${
              layout.fontStyles.sectionHeading.bold ? "font-bold" : ""
            } ${layout.fontStyles.sectionHeading.italics ? "italic" : ""} mb-2`}
          >
            Education
          </h2>
          {educations.slice(0, 1).map((edu, index) => (
            <div key={index} className="mb-2">
              <h3 className={`text-[${layout.fontSizes.normal}px] font-semibold`}>
                {edu.content.degree}
              </h3>
              <p className={`text-[${layout.fontSizes.normal}px] italic`}>
                {edu.content.institution}
              </p>
              <p className={`text-[${layout.fontSizes.normal - 2}px]`}>
                {formatDate(edu.content.start_date)} - {formatDate(edu.content.end_date)}
              </p>
            </div>
          ))}
        </div>
  
        {/* Skills Section */}
        <div
          className={
            layout.alignments.sectionHeading === "center" ? "text-center" : ""
          }
        >
          <h2
            className={`text-[${layout.fontSizes.sectionHeading}px] ${
              layout.fontStyles.sectionHeading.bold ? "font-bold" : ""
            } ${layout.fontStyles.sectionHeading.italics ? "italic" : ""} mb-2`}
          >
            Skills
          </h2>
          <p className={`text-[${layout.fontSizes.normal}px]`}>
            {skills
              .slice(0, 5)
              .map((skill) => skill.content.value || skill.content.name)
              .join(", ")}
          </p>
        </div>
      </div>
    );
  };

export default TemplateSelectionDialog;
