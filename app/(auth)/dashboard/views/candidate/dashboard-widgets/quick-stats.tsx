import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

interface QuickStat {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
}

export const QuickStats: React.FC = () => {
  const stats: QuickStat[] = [
    { icon: TrendingUp, title: "Profile Views", value: "152", change: "+12%" },
    {
      icon: DollarSign,
      title: "Avg. Salary Range",
      value: "$110k - $140k",
      change: "+5%",
    },
    {
      icon: Clock,
      title: "Time to Interview",
      value: "14 days",
      change: "-2 days",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <stat.icon className="w-6 h-6 text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">{stat.title}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
