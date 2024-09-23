import React from "react";
import { CompanyProfileData } from "@/lib/company/validation";
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { naicsList } from "@/lib/data/form-value-industry-naics";

interface CompanyProfileRightPanelProps {
  formData: CompanyProfileData;
  logoPreview: string | null;
  hasLogo: boolean;
}

export default function CompanyProfileRightPanel({
  formData,
  logoPreview,
  hasLogo,
}: CompanyProfileRightPanelProps) {
  const getIndustryLabel = (code: string) => {
    return naicsList.find((industry) => industry.code === code)?.label || code;
  };

  const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h3 className="text-gray-400 text-sm">Profile Card Preview</h3>
        <p className="text-xs text-gray-400">
          What potential candidates will see alongside your job post
        </p>
      </div>
      <Card className="w-full bg-gray-50 shadow-lg">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <CardTitle className="text-lg font-bold text-gray-800">
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex">
          <div className="w-1/4 pr-4 flex items-center justify-center">
              {hasLogo ? (
                <div className="flex items-center justify-center w-full h-32">
                  <Image
                    src={`/api/partners?partnerLogo=${formData.id}&type=logo`}
                    alt="Company Logo"
                    width={128}
                    height={128}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
              ) : logoPreview ? (
                <div className="flex items-center justify-center w-full h-32">
                  <Image
                    src={logoPreview}
                    alt="Company Logo"
                    width={128}
                    height={128}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-32 bg-gray-200 rounded-lg">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto grid-flow-row-dense">
                {formData.name && (
                  <div className="col-span-full flex items-center mb-2">
                    <Building className="w-6 h-6 mr-3 text-gray-600" />
                    <h2 className="text-md font-bold text-gray-800">
                      {formData.name}
                    </h2>
                  </div>
                )}
                {formData.description && (
                  <div className="col-span-full mb-4">
                    <p className="text-sm text-gray-600 ml-9">
                      {formData.description}
                    </p>
                  </div>
                )}

                {formData.industry && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Briefcase className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {getIndustryLabel(formData.industry)}
                    </span>
                  </div>
                )}

                {formData.size && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Users className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {formData.size} employees
                    </span>
                  </div>
                )}

                {formData.foundedYear && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      Founded in {formData.foundedYear}
                    </span>
                  </div>
                )}

                {(formData.headquarters?.city ||
                  formData.headquarters?.state ||
                  formData.headquarters?.country) && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {[
                        formData.headquarters?.city,
                        formData.headquarters?.state,
                        formData.headquarters?.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {formData.website && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Globe className="w-5 h-5 mr-3 text-gray-600" />
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Company Website
                    </a>
                  </div>
                )}

                {formData.contactEmail && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Mail className="w-5 h-5 mr-3 text-gray-600" />
                    <a
                      href={`mailto:${formData.contactEmail}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {formData.contactEmail}
                    </a>
                  </div>
                )}

                {formData.phoneNumber && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <Phone className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {formatPhoneNumber(formData.phoneNumber)}
                    </span>
                  </div>
                )}

                {(formData.socialMedia?.linkedin ||
                  formData.socialMedia?.twitter ||
                  formData.socialMedia?.facebook) && (
                  <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <span className="mr-3 text-sm font-medium text-gray-800">
                      Connect:
                    </span>
                    <div className="flex space-x-3">
                      {formData.socialMedia?.linkedin && (
                        <a
                          href={`https://www.linkedin.com/in/${formData.socialMedia.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {formData.socialMedia?.twitter && (
                        <a
                          href={`https://twitter.com/${formData.socialMedia.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {formData.socialMedia?.facebook && (
                        <a
                          href={`https://www.facebook.com/${formData.socialMedia.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-800 transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
