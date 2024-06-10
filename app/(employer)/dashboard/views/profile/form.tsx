import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MatchWideJobToRole, getJobEmbedding } from "@/lib/engine/wide_job_to_role";

export function MyProfileForm() {
  const handleClick = async () => {
    const jobID = "6d98e834-6513-4736-8cc8-b190a473ed3b";
    try {
      const embedding = await getJobEmbedding(jobID);
      console.log("Job Embedding:", embedding);
      // Handle the retrieved embedding data as needed
    } catch (error) {
      console.error("Error retrieving job embedding:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };


  return (
    <div className="flex flex-col gap-6">
      {/* Personal */}
      {/* TODO: Populate this from token, etc after auth is implemented */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Personal</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="firstName" id="firstName" placeholder="First name" />
          <Input type="lastName" id="lastName" placeholder="Last name" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="email" id="email" placeholder="Email" />
        </div>
      </div>
      {/* Notications */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Notifications</h2>
        <div className="flex flex-col gap-4">
          {/* Switch 2 */}
          <div className="flex flex-row justify-between border border-1 border-gray-2oo rounded-md p-4">
            <p className="text-sm text-gray-700 font-normal">
              Receive email alerts for AI candidate matches
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
            </div>
          </div>

          {/* Switch 2 */}
          <div className="flex flex-row justify-between border border-1 border-gray-2oo rounded-md p-4">
            <p className="text-sm text-gray-700 font-normal">
              Receive email alerts of new job applicants
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={() => {
            MatchWideJobToRole().catch((error) => {
              console.error("Error in MatchWideJobToRole:", error);
              // Handle the error appropriately (e.g., display an error message)
            });
          }}
          className="bg-blue-500 text-white rounded-md p-2"
        >
          Fetch Job
        </button>{" "}
        <button
      onClick={handleClick}
      className="bg-blue-500 text-white rounded-md p-2"
    >
      Get Job Embedding
    </button>
      </div>
    </div>
  );
}
