import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building,
  Users,
  Calendar,
  MapPin,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyProfileImportanceProps {
  isCollapsed: boolean;
}

export default function CompanyProfileImportance({
  isCollapsed: initialIsCollapsed,
}: CompanyProfileImportanceProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialIsCollapsed);

  useEffect(() => {
    setIsCollapsed(initialIsCollapsed);
  }, [initialIsCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const reasons = [
    {
      icon: <Building className="w-5 h-5 text-blue-600" />,
      title: "Company Name",
      description:
        "Establishes your brand identity and helps candidates recognize and remember your company.",
    },
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: "Company Size",
      description:
        "Gives insight into the scale of operations and potential team dynamics, which can be crucial for cultural fit.",
    },
    {
      icon: <Calendar className="w-5 h-5 text-orange-600" />,
      title: "Founded Year",
      description:
        "Indicates company stability and history, which can be attractive to candidates seeking long-term opportunities.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-red-600" />,
      title: "Location",
      description:
        "Helps candidates assess commute times or relocation needs, a key factor in job decisions.",
    },
    {
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      title: "Company Description",
      description:
        "Offers a snapshot of your company's mission, values, and unique selling points, helping candidates align their career goals.",
    },
    {
      icon: <Share2 className="w-5 h-5 text-pink-600" />,
      title: "Social Media Presence",
      description:
        "Provides additional channels for candidates to engage with your brand and get a feel for company culture.",
    },
  ];

  return (
    <Card className="w-full bg-gray-50 shadow-lg">
      <CardHeader className="bg-gray-100 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-gray-800">
            Why Complete Your Company Profile?
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleCollapse}>
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            A detailed company profile significantly enhances your ability to
            attract top talent. Here's how each piece of information influences
            potential candidates:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-start bg-white p-4 rounded-lg shadow"
              >
                <div className="mr-4 mt-1">{reason.icon}</div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-gray-600">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
