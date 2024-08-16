import React from "react";
import { motion } from "framer-motion";
import { BotIcon } from "lucide-react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { CancelJDGeneration } from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/runners/cancel-jd-generation";

const JDBuilderWaitingPanel = () => {
  const { jdBuilderWizard, setJDBuilderWizard, setExpanded } = useStore();

  const jdGenerationId = jdBuilderWizard.generationProcessId;

  const handleCancelJDGeneration = async () => {
    setExpanded(true);
    const result = await CancelJDGeneration({ processId: jdGenerationId! }); // TODO: make this check more elegant than !
    setJDBuilderWizard({ roleToGenerate: null, jdGenerationRunnerID: null });
  };

  // Check if roles or keyPersonnel are not empty
  const renderSelectRoleInstructions =
    jdBuilderWizard.personnelRoles.roles.length > 0 ||
    jdBuilderWizard.personnelRoles.keyPersonnel.length > 0;

  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mx-auto min-h-[200px] flex flex-col justify-center"
    >
      {renderSelectRoleInstructions &&
        !jdBuilderWizard.jdGenerationRunnerID && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BotIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600">
                Choose a role and we'll create a draft for the job description.
              </p>
            </div>
          </motion.div>
        )}

      {jdBuilderWizard.roleToGenerate &&
        jdBuilderWizard.jdGenerationRunnerID && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BotIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600">
                We're drafting a job description for{" "}
                {jdBuilderWizard.roleToGenerate}. Please wait...
              </p>
            </div>
          </motion.div>
        )}

      {!renderSelectRoleInstructions && (
        <motion.div
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BotIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-600">Loading roles...</p>
          </div>
        </motion.div>
      )}

      {jdBuilderWizard.jdGenerationRunnerID && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            This process typically takes 2-3 minutes. We appreciate your
            patience.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleCancelJDGeneration}
              className="btn btn-primary"
            >
              Cancel Generation
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JDBuilderWaitingPanel;
