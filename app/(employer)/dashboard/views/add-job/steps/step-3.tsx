import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddJDStepThree() {
  // Get AddJD state from the store
  const { user, addJD, setAddJD } = useStore();

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-semibold text-base leading-7 text-gray-900">
            Three
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 leading-7">
          <p>
            Simply upload a PDF or Word file of your job description, and we'll
            take care of the rest.
          </p>{" "}
          <p>
            Catalyst will automatically extract all the necessary details to
            help you find the perfect candidate.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
