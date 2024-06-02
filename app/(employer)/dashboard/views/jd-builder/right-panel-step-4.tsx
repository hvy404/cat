import useStore from "@/app/state/useStore";
import { motion } from "framer-motion";
import { BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JDBuilderRightStep4() {
  const {
    user,
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
    isExpanded,
    setExpanded,
  } = useStore();

  const sowID = jdBuilderWizard.sowID ?? "";
  const employerID = user?.uuid ?? "";

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

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="w-full">
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
              <span className="font-bold">Congratulations!</span> Your job
              description draft is ready for review. Feel free to make any
              edits. When you're satisfied, hit 'Publish' to proceed to the
              final steps and get your job posted.
            </p>
          </div>
        </motion.div>
      </div>
      <div className="w-full">
        <motion.div
          className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
          variants={messageVariants}
          initial="hidden"
          custom={2} // No delay for the first message
          animate="visible"
        >
          <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
            <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
            <div className="flex flex-col text-gray-700 leading-7 text-sm">
              <span className="font-bold">Quick tips:</span>{" "}
              <div>
                Press
                <span className="text-xs font-bold border border-1 bg-gray-50 p-1 rounded-md mx-2">
                  + +
                </span>
                at any time and I'll autocomplete your sentence.
              </div>
              <div>
                Press
                <span className="text-xs font-bold border border-1 bg-gray-50 p-1 rounded-md mx-2">
                  /
                </span>
                on a new line to see additional formatting options.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
