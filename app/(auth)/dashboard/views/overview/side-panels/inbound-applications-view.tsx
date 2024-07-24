import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChevronRight } from 'lucide-react';
import useStore from "@/app/state/useStore";

const InboundApplicantsSidePanel = () => {

  const { user } = useStore();

  const mockApplicants = [
    { id: 1, name: 'John Doe', role: 'Software Engineer', status: 'New' },
    { id: 2, name: 'Jane Smith', role: 'Product Manager', status: 'Reviewed' },
    { id: 3, name: 'Mike Johnson', role: 'UX Designer', status: 'Interviewed' },
  ];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Inbound Applicants {user.uuid}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-4">
          {mockApplicants.map((applicant) => (
            <div key={applicant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">{applicant.name}</h3>
                <p className="text-sm text-gray-500">{applicant.role}</p>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {applicant.status}
                </span>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4">View All Applicants</Button>
      </CardContent>
    </Card>
  );
};

export default InboundApplicantsSidePanel;