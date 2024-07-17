import React from 'react';
import { Item, ItemType } from './types';
import { personalLabelMap } from './personal-labels';

const renderLabel = (label: string) => (
  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mr-2 mb-2 select-none">
    {label}
  </span>
);

export const renderCondensedItemContent = (item: Item): React.ReactNode => {
  switch (item.type) {
    case "personal":
      if (item.content.key === "Location") {
        const { city, state, zipcode } = item.content.value as {
          city: string | null;
          state: string | null;
          zipcode: string | null;
        };
        const locationParts = [city, state, zipcode].filter(Boolean);
        const locationString = locationParts.join(", ");
        return (
          <div className="space-y-1 select-none">
            {renderLabel("Personal")}
            <h3 className="text-md font-semibold text-gray-800">Address</h3>
            <p className="text-sm text-gray-600">
              {locationString || "Not specified"}
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Personal")}
          <h3 className="text-md font-semibold text-gray-800">
            {personalLabelMap[item.content.key] || item.content.key}
          </h3>
          <p className="text-sm text-gray-600">
            {item.content.value || "Not specified"}
          </p>
        </div>
      );
    case "experience":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Experience")}
          <h4 className="text-md font-semibold text-gray-800">
            {item.content.job_title}
          </h4>
          <p className="text-sm text-gray-600">{item.content.organization}</p>
        </div>
      );
    case "education":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Education")}
          <h4 className="text-md font-semibold text-gray-800">
            {item.content.degree}
          </h4>
          <p className="text-sm text-gray-600">{item.content.institution}</p>
        </div>
      );
    case "skills":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Skill")}
          <h4 className="text-sm text-gray-800">{item.content.value}</h4>
        </div>
      );
    case "certifications":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Certification")}
          <h4 className="text-sm text-gray-800">{item.content.name}</h4>
          <p className="text-sm text-gray-600">
            {item.content.issuing_organization}
          </p>
        </div>
      );
    case "projects":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Project")}
          <h4 className="text-md font-semibold text-gray-800">
            {item.content.title}
          </h4>
        </div>
      );
    case "publications":
      return (
        <div className="space-y-1 select-none">
          {renderLabel("Publication")}
          <h4 className="text-md font-semibold text-gray-800">
            {item.content.title}
          </h4>
        </div>
      );
    default:
      return null;
  }
};