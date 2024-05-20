import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddJDStep2Form from "@/app/(employer)/dashboard/views/add-job/mods/step-2-form";

export default function AddJDStepTwo() {
  // Get AddJD state from the store
  const { user, addJD, setAddJD } = useStore();

  return (
    <>
{/*         <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-semibold text-base leading-7 text-gray-900">
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 leading-7">
            <p>
              Let us know a bit more about the job you're looking to fill.
            </p>
          </CardContent>
        </Card> */}
        <AddJDStep2Form />
    </>
  );
}
