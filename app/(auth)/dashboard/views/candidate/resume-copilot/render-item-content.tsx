import React from 'react';
import { parse, format, isValid } from 'date-fns';
import { Item } from './types';
import { personalLabelMap } from './personal-labels';
import { Button } from '@/components/ui/button';
import { Edit2, ExternalLink } from 'lucide-react';
import Alert from './alert';
import Spinner from './spinner';

interface RenderItemContentProps {
  item: Item | undefined;
  editedItems: Record<string, Item>;
  alerts: {
    id: string;
    message: {
      analysis: {
        recentEdit: string;
        overallImpact: string;
      };
      recommendation: {
        action: "add" | "remove" | "modify" | "none";
        targetItem: string;
        rationale: string;
        implementation: string;
      };
      feedback: {
        strengths: string[];
        areasForImprovement: string[];
        competitiveEdge: string;
      };
      nextSteps: {
        priority: "High" | "Medium" | "Low";
        focus: string;
        guidance: string;
        progression: string;
      };
    };
    isMinimized: boolean;
  }[];
  processingItems: Set<string>;
  handleEdit: (item: Item) => void;
  toggleAlertMinimize: (id: string) => void;
}

const formatDate = (dateString: string): string => {
  if (dateString.toLowerCase() === 'present') {
    return 'Present';
  }
  const date = parse(dateString, 'yyyy-MM', new Date());
  if (isValid(date)) {
    return format(date, 'MMMM yyyy');
  }
  return dateString; // Return original string if parsing fails
};

export const createRenderItemContent = (
  editedItems: Record<string, Item>,
  alerts: RenderItemContentProps['alerts'],
  processingItems: Set<string>,
  handleEdit: (item: Item) => void,
  toggleAlertMinimize: (id: string) => void
) => {
  const RenderItemContent = (item: Item | undefined) => {
    if (!item) {
      console.warn("Attempted to render undefined item");
      return null;
    }

    const editedItem = editedItems[item.id] || item;

    const content = (() => {
      switch (editedItem.type) {
        case "personal":
          if (editedItem.content.key === "Location") {
            const { city, state, zipcode } = editedItem.content.value as {
              city: string | null;
              state: string | null;
              zipcode: string | null;
            };
            const locationParts = [city, state, zipcode].filter(Boolean);
            const locationString = locationParts.join(", ");
            return (
              
              <div className="space-y-1 select-none">
                <h3 className="text-md font-semibold text-gray-800">Address</h3>
                <p className="text-sm text-gray-600">
                  {locationString || "Not specified"}
                </p>
              </div>
            );
          }
          return (
            <div className="space-y-1 select-none">
              <h3 className="text-md font-semibold text-gray-800">
                {personalLabelMap[editedItem.content.key] ||
                  editedItem.content.key}
              </h3>
              <p className="text-sm text-gray-600">
                {editedItem.content.value || "Not specified"}
              </p>
            </div>
          );
        case "experience":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.job_title}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {editedItem.content.organization}
              </p>
              <p className="text-sm text-gray-600">
                {`${formatDate(editedItem.content.start_date)} - ${formatDate(editedItem.content.end_date)}`}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {editedItem.content.responsibilities}
              </p>
            </div>
          );
        case "education":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.degree}
              </h4>
              <p className="text-sm font-medium text-gray-700">
                {editedItem.content.institution}
              </p>
              <p className="text-sm text-gray-600">
                {`${formatDate(editedItem.content.start_date)} - ${formatDate(editedItem.content.end_date)}`}
              </p>
            </div>
          );
        case "skills":
          return (
            <div className="space-y-1 select-none">
              <h3 className="text-md font-semibold text-gray-800">Skill</h3>
              <p className="text-sm text-gray-600">
                {editedItem.content.value}
              </p>
            </div>
          );
        case "certifications":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {editedItem.content.name}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.issuing_organization}
              </p>
              <p className="text-sm text-gray-600">
                {`Obtained: ${formatDate(editedItem.content.date_obtained)}`}
              </p>
              {editedItem.content.expiration_date && (
                <p className="text-sm text-gray-600">
                  {`Expires: ${formatDate(editedItem.content.expiration_date)}`}
                </p>
              )}
              {editedItem.content.credential_id && (
                <p className="text-sm text-gray-600">
                  {`Credential ID: ${editedItem.content.credential_id}`}
                </p>
              )}
              {editedItem.content.credential_url && (
                <a
                  href={editedItem.content.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View Credential
                  <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </div>
          );
        case "projects":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-md font-semibold text-gray-800">
                {editedItem.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.description}
              </p>
            </div>
          );
        case "publications":
          return (
            <div className="space-y-1 select-none">
              <h4 className="text-sm font-semibold text-gray-800">
                {editedItem.content.title}
              </h4>
              <p className="text-sm text-gray-700">
                {editedItem.content.journal_or_conference}
              </p>
              <p className="text-sm text-gray-600">{`Published: ${formatDate(editedItem.content.publication_date)}`}</p>
            </div>
          );
        default:
          return null;
      }
    })();

    const itemAlert = alerts.find((alert) => alert.id === editedItem.id);
    const isProcessing = processingItems.has(editedItem.id);

    return (
      <div onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-grow pr-10">{content}</div>
          <Button
  onClick={(e) => {
    e.stopPropagation();
    handleEdit(editedItem);
  }}
  className="flex-shrink-0 p-1 h-6 w-6"
  variant="ghost"
>
  <Edit2 size={16} className="text-gray-400" />
</Button>

        </div>
        <div className="mt-auto pt-2">
          {isProcessing ? (
            <div className="flex items-center justify-center h-8">
              <Spinner />
            </div>
          ) : itemAlert ? (
            <Alert
  message={itemAlert.message}
  isMinimized={itemAlert.isMinimized}
  onToggleMinimize={() => toggleAlertMinimize(editedItem.id)}
/>
          ) : null}
        </div>
      </div>
      </div>
    );
  };

  RenderItemContent.displayName = 'RenderItemContent';
  return RenderItemContent;
};