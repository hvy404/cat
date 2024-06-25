import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
//import StatsImpressionsChart from "@/app/(auth)/dashboard/views/overview/mods/stats-impression-chart";

import dynamic from 'next/dynamic';

const StatsImpressionsChart = dynamic(() => import('@/app/(auth)/dashboard/views/overview/mods/stats-impression-chart'), {
  ssr: false
});


export default function EmployerDashboardOverviewStats() {
  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Inbound Applicant</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Design: This shows applicants who have applied to a job. We will
            also show if it was through a standard search or AI recommendation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Impressions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            +10% from last month
          </div>
        </CardContent>
        <CardFooter>
          <StatsImpressionsChart />
        </CardFooter>
      </Card>

      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recruit</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Design: This shows applicants who have been invited to apply to a
            job. We will also show if the match was through a standard search or
            AI recommendation.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
