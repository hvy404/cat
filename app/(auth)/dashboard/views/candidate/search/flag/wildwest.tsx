import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WildWest = () => {
  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-x-2">
          <span>🤠</span>
          Wild West Search Mode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-700">This mode loosens the machine learning parameters and criteria, offering you a broader range of results. Please note, as this is an experimental feature, the results may vary in accuracy and relevance.</p>
      </CardContent>
    </Card>
  );
};
