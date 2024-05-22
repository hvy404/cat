import React from "react";
import useStore from "@/app/state/useStore";
import { GrabDetectedRoles } from "@/lib/jd-builder/fetcher/fetch-detected-roles";
import { getJobDescription } from "@/lib/jd-builder/generate-job-description";
import { motion, AnimatePresence } from 'framer-motion';


export default function JDBuilderDetectedRoles() {
  // Get state from the store
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
  useStore();

  // Get the sowID from the store
  const sowID = jdBuilderWizard.sowID ?? '';

  const onClick = async () => {
    const data = await GrabDetectedRoles(sowID);
    // set the result array to store
    setJDBuilderWizard({ personnelRoles: data });
  };

  return (
    <div className="w-full p-12">
      <button onClick={onClick}>Grab</button>
      <div className="flex flex-col gap-4 justify-center overflow-y-auto max-h-[60vh]">
      {jdBuilderWizard.personnelRoles.map((role) => (
        <AnimatePresence>
        {jdBuilderWizard.personnelRoles.map((role, index) => (
          <motion.div 
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-row bg-muted/30 hover:bg-gray-100/70 rounded-md p-4"
          >
            {role}
          </motion.div>
        ))}
      </AnimatePresence>
      ))}
      </div>
    </div>
  );
}
