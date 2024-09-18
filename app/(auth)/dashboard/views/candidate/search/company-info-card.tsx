import React from "react";
import {
  Building,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CompanyNode } from "@/lib/jobs/mutation";
import Image from "next/image";

interface CompanyInfoCardProps {
  company: Partial<CompanyNode> | null;
  isPrivateEmployer: boolean;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
  isPrivateEmployer,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {company?.hasLogo && (
            <div className="flex-shrink-0 mr-4">
              <Image
                unoptimized
                src={`/api/partners?partnerLogo=${company.id}&type=logo`}
                alt={`${company.name} logo`}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          )}
          <div className="flex-grow space-y-2">
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-semibold text-sm">
                {company?.name || "Private Employer"}
              </span>
            </div>
            {isPrivateEmployer ? (
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <ShieldCheck className="w-4 h-4 inline mr-2 text-blue-500" />
                  This employer has chosen to remain private.
                </p>
                <p>
                  Some companies choose to keep their information confidential due
                  to the sensitive nature of their work or for strategic reasons.
                  Rest assured, we've verified this employer's credentials and trust
                  them as a legitimate hiring entity.
                </p>
              </div>
            ) : company ? (
              <div className="space-y-2 text-sm text-gray-600">
                {company.description && <p>{company.description}</p>}
                {company.website && (
                  <p>
                    <Globe className="w-4 h-4 inline mr-2" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Company Website
                    </a>
                  </p>
                )}
                {company.phoneNumber && (
                  <p>
                    <Phone className="w-4 h-4 inline mr-2" />
                    {company.phoneNumber}
                  </p>
                )}
                {company.contactEmail && (
                  <p>
                    <Mail className="w-4 h-4 inline mr-2" />
                    {company.contactEmail}
                  </p>
                )}
                {company.headquarters?.city && (
                  <p>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {`${company.headquarters.city}${
                      company.headquarters.state
                        ? `, ${company.headquarters.state}`
                        : ""
                    }${
                      company.headquarters.country
                        ? `, ${company.headquarters.country}`
                        : ""
                    }`}
                  </p>
                )}
                {company.foundedYear && (
                  <p>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Founded in {company.foundedYear}
                  </p>
                )}
                {company.size && (
                  <p>
                    <Users className="w-4 h-4 inline mr-2" />
                    Company Size: {company.size}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;