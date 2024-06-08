import { motion } from "framer-motion";

export function CollectRightPanelStart() {
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
    <div className="flex flex-col items-center h-full justify-center md:p-4 lg:p-12 gap-4">
      {/* Instruction */}
      <motion.div
        className="flex flex-col w-full border border-1 border-gray-200 p-4 rounded-md gap-4 leading-6"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="text-sm space-y-2">
          <h2 className="text-gray-800 font-semibold">
            Collections: Streamline Your Job Descriptions
          </h2>
          <p className="text-gray-800">
            Collections are pre-written, reusable snippets of information about
            your company. These snippets are categorized into two types:
            introductions and benefits.
          </p>
          <p>
            When you use the Job Description Builder to create job descriptions,
            these snippets will be automatically incorporated. You can also
            manually insert them into your job descriptions using the editor.
          </p>
        </div>
      </motion.div>
      {/* Instruction */}
      <motion.div
        className="flex flex-col w-full border border-1 border-gray-200 p-4 rounded-md gap-4 leading-6"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <div className="text-sm space-y-2">
          <h2 className="text-gray-800 font-semibold">
            Set Your Primary Snippets
          </h2>
          <p className="text-gray-800">
            For each category (introductions and benefits), you can set one
            snippet as the primary option. The AI will use these primary
            snippets by default when generating job descriptions.
          </p>
          <p className="text-gray-800">
            To set a snippet as primary, simply toggle the switch next to it.
          </p>
        </div>
      </motion.div>
      {/* Instruction */}
      <motion.div
        className="flex flex-col w-full border border-1 border-gray-200 p-4 rounded-md gap-4 leading-6"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <div className="text-sm space-y-2">
          <h2 className="text-gray-800 font-semibold">
            Customize Your Generated Job Descriptions
          </h2>
          <p className="text-gray-800">
            After the AI generates a job description, you can easily customize
            it by replacing sections with any of your saved snippets. Simply
            click on the desired section and select a snippet from the menu to
            replace it with.
          </p>
          <p className="text-gray-800">
            Collections make it easy to maintain consistent branding and
            messaging across all your job descriptions while still allowing for
            flexibility and customization.
          </p>
        </div>
      </motion.div>
    </div>
  );
}