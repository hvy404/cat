import React from 'react';
import { Item } from './types';
import { personalLabelMap } from './personal-labels';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import Alert from './alert';
import Spinner from './spinner';

interface RenderItemContentProps {
  item: Item | undefined;
  editedItems: Record<string, Item>;
  alerts: {
    id: string;
    message: {
      recentEdit: string;
      nextAction: "add" | "remove" | "modify" | "none";
      nextReason: string;
    };
    isMinimized: boolean;
  }[];
  processingItems: Set<string>;
  handleEdit: (item: Item) => void;
  toggleAlertMinimize: (id: string) => void;
}

export const createRenderItemContent = (
  editedItems: Record<string, Item>,
  alerts: RenderItemContentProps['alerts'],
  processingItems: Set<string>,
  handleEdit: (item: Item) => void,
  toggleAlertMinimize: (id: string) => void
) => {
  return (item: Item | undefined) => {
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
              <p className="text-sm text-gray-600">{`${editedItem.content.start_date} - ${editedItem.content.end_date}`}</p>
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
              <p className="text-sm text-gray-600">{`${editedItem.content.start_date} - ${editedItem.content.end_date}`}</p>
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
              <p className="text-sm text-gray-600">{`Obtained: ${editedItem.content.date_obtained}`}</p>
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
              <p className="text-sm text-gray-600">{`Published: ${editedItem.content.publication_date}`}</p>
            </div>
          );
        default:
          return null;
      }
    })();

    const itemAlert = alerts.find((alert) => alert.id === editedItem.id);
    const isProcessing = processingItems.has(editedItem.id);

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-grow pr-10">{content}</div>
          <Button
            onClick={() => handleEdit(editedItem)}
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
    );
  };
};