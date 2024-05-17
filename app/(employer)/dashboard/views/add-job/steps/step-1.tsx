import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddJDStepOne() {
  // Get AddJD state from the store
  const { user, addJD, setAddJD } = useStore();

  return (
    <>
      {!addJD.isProcessing && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-semibold text-base leading-7 text-gray-900">
              Upload your job description
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 leading-7">
            <p>
              Simply upload a PDF or Word file of your job description, and
              we'll take care of the rest.
            </p>{" "}
            <p>
              Catalyst will automatically extract all the necessary details to
              help you find the perfect candidate.
            </p>
          </CardContent>
        </Card>
      )}

      {addJD.isProcessing && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-semibold text-base leading-7 text-gray-900">
              Your job description is being processed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 leading-7">
            <p>
              Your job description is now being processed by Catalyst. This may
              take a few moments.
            </p>
            <p>
              Hang tight! We're extracting the necessary details to match you
              with ideal candidates.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
