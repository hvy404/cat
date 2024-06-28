import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface CareerInsight {
  date: string;
  applications: number;
  interviews: number;
}

interface InsightsCardProps {
  data: CareerInsight[];
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ data }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-sm font-semibold text-gray-800">
        Career Insights
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#4B5563" />
          <YAxis stroke="#4B5563" />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", border: "none" }}
            itemStyle={{ color: "#1F2937" }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#4B5563"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="interviews"
            stroke="#9CA3AF"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
