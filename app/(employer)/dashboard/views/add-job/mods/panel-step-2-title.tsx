import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { TitleOptions } from "@/lib/dashboard/panels/step-2-title";

export default function Step2SubPanelTitle() {
  const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  const [jobTitle, setJobTitle] = useState("");

  // Local state to manage input value (useState)
  useEffect(() => {
    if (addJD.jobDetails.length > 0) {
      setJobTitle(addJD.jobDetails[0].title);
    }
  }, [addJD.jobDetails]);

  // Function to update only 'title' from jobDetails in store
  const handleUpdateJobTitle = () => {
    const updatedJobDetails = addJD.jobDetails.map((jobDetail, index) =>
      index === 0 ? { ...jobDetail, title: jobTitle } : jobDetail
    );
    setAddJD({ jobDetails: updatedJobDetails });
  };

  // click handler to call TitleOptions function and console log the result
  const handleTitleOptions = async () => {
    const result = await TitleOptions();
    // set the jobDetails in the store
    setAddJD({ jobDescriptionTitles: result });
  };

  // Fetch job title suggestions on page load if not already set
  useEffect(() => {
    if (addJD.jobDescriptionTitles.length === 0) {
      handleTitleOptions();
    }
  }, []);

  return (
    <div>
      <div className="space-y-2 flex flex-col">
        <p className="leading-7 text-sm font-medium text-gray-700">
          These are good as well:
        </p>
      </div>
      {/* Render array of jobDescriptionTitles */}
      <div className="flex flex-col gap-4">
        {addJD.jobDescriptionTitles.map((title, index) => (
          <div
            key={index}
            className="flex p-4 cursor-pointer text-sm border border-1 border-gray-200/60 hover:border-gray-100 hover:bg-gray-100 rounded-md transition-colors duration-200 ease-in-out"
          >
            <p>{title.title}</p>
          </div>
        ))}
      </div>
      <Button onClick={handleTitleOptions}>Title Options</Button>
    </div>
  );
}
