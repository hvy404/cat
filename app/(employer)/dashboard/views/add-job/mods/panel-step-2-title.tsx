import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { TitleOptions } from "@/lib/dashboard/panels/step-2-title";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

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
    <>
      {addJD.jobDescriptionTitles.length === 0 && ( //
        <div className="flex flex-col">
          <LoaderCircle className="w-10 h-10 mx-auto animate-spin text-gray-300" />
        </div>
      )}

      {addJD.jobDescriptionTitles.length > 0 && (
        <>
          <div className="space-y-2 flex flex-col">
            <p className="leading-7 text-sm font-medium text-gray-700 text-center">
              Some suggestions to get you started
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {addJD.jobDescriptionTitles.map((title, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex p-4 cursor-pointer text-sm border border-1 border-gray-200/60 hover:border-gray-100 hover:bg-gray-100 rounded-md transition-colors duration-300 ease-in-out"
              >
                <p
                  onClick={() => {
                    const updatedJobDetails = addJD.jobDetails.map(
                      (detail, index) =>
                        index === 0 ? { ...detail, title: title.title } : detail
                    );
                    setAddJD({ jobDetails: updatedJobDetails });
                  }}
                >
                  {title.title}
                </p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
