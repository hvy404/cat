import useStore from "@/app/state/useStore";
import { motion } from "framer-motion";
import { BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancelJDGeneration } from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/runners/cancel-jd-generation";

export default function JDBuilderRightStep3() {
  const {
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
    isExpanded,
    setExpanded,
  } = useStore();

  const jdGenerationId = jdBuilderWizard.generationProcessId;

  // Define the animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const stepMessages = [
    "Choose a role and we'll create a draft for the job description.",
  ];

  const beginGenerationMessage = `We're drafting a job description for ${jdBuilderWizard.roleToGenerate}. Please wait...`;

  // Check if roles or keyPersonnel are not empty
  const renderSelectRoleInstructions =
    jdBuilderWizard.personnelRoles.roles.length > 0 ||
    jdBuilderWizard.personnelRoles.keyPersonnel.length > 0;

  // handler to cancel JD generation
  const handleCancelJDGeneration = async () => {
    setExpanded(true);
    const result = await CancelJDGeneration({ processId: jdGenerationId! }); // TODO: make this check more elegant than !
    setJDBuilderWizard({ roleToGenerate: null, jdGenerationRunnerID: null });
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="w-full">
        {renderSelectRoleInstructions &&
          !jdBuilderWizard.jdGenerationRunnerID && (
            <motion.div
              className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
              variants={messageVariants}
              initial="hidden"
              custom={0} // No delay for the first message
              animate="visible"
            >
              <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
                <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <p className="text-gray-700 leading-7 text-sm">
                  {stepMessages[0]}
                </p>
              </div>
            </motion.div>
          )}
        {jdBuilderWizard.roleToGenerate &&
          jdBuilderWizard.jdGenerationRunnerID && (
            <motion.div
              className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
              variants={messageVariants}
              initial="hidden"
              custom={0} // No delay for the first message
              animate="visible"
            >
              <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
                <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <p className="text-gray-700 leading-7 text-sm">
                  {beginGenerationMessage}
                </p>
              </div>
            </motion.div>
          )}
        {/* Render role loading message */}
        {!renderSelectRoleInstructions && (
          <motion.div
            className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
            variants={messageVariants}
            initial="hidden"
            custom={0} // No delay for the first message
            animate="visible"
          >
            <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
              <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
              <p className="text-gray-700 leading-7 text-sm">
                Loading roles...{" "}
              </p>
            </div>
          </motion.div>
        )}
      </div>
      {jdBuilderWizard.jdGenerationRunnerID && (
        <div className="flex flex-row justify-center">
          <Button
            variant={"outline"}
            onClick={handleCancelJDGeneration}
            className="btn btn-primary"
          >
            Cancel Generation
          </Button>
        </div>
      )}{" "}
    </div>
  );
}
