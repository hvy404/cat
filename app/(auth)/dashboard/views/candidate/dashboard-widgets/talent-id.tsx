import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchCatalystId } from "@/lib/dashboard/candidate/fetch-catalyst-id";

interface TalentIdProps {
  handleTalentIDLearnMore: (candidateId: string) => void;
  candidateId: string;
}

export default function TalentId({
  handleTalentIDLearnMore,
  candidateId,
}: TalentIdProps) {
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();

  const [catalystId, setCatalystId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    controls1.start("initial");
    controls2.start("initial");
    controls3.start("initial");
  }, [controls1, controls2, controls3]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await fetchCatalystId(candidateId);
        if (isMounted) {
          if (data === null) {
            setError("Failed to fetch or generate Catalyst ID");
          } else {
            setCatalystId(data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("An error occurred while fetching the Catalyst ID");
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  const loadingVariants = {
    start: {
      scale: 0.8,
      opacity: 0.3,
    },
    end: {
      scale: 1,
      opacity: 1,
    },
  };

  const loadingTransition = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-16 h-16 mb-4 relative"
        >
          <motion.div
            className="absolute inset-0 border-2 border-gray-300 rounded-full"
            initial="start"
            animate="end"
            variants={loadingVariants}
            transition={{
              ...loadingTransition,
              delay: 0,
            }}
          />
          <motion.div
            className="absolute inset-2 border-2 border-gray-400 rounded-full"
            initial="start"
            animate="end"
            variants={loadingVariants}
            transition={{
              ...loadingTransition,
              delay: 0.2,
            }}
          />
          <motion.div
            className="absolute inset-4 border-2 border-gray-500 rounded-full"
            initial="start"
            animate="end"
            variants={loadingVariants}
            transition={{
              ...loadingTransition,
              delay: 0.4,
            }}
          />
        </motion.div>
        <motion.p
          className="text-sm font-medium text-gray-600"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          Fetching G2X ID
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center p-4 border border-red-300 rounded-md bg-red-100 text-red-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md"
      initial={{ backgroundColor: "#ffffff", opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        backgroundColor: "#1f2937",
        transition: { duration: 0.3 },
      }}
      onHoverStart={() => {
        controls1.start("hover");
        controls2.start("hover");
        controls3.start("hover");
      }}
      onHoverEnd={() => {
        controls1.start("initial");
        controls2.start("initial");
        controls3.start("initial");
      }}
    >
      <motion.p
        className="text-sm font-medium text-gray-700"
        variants={{
          initial: { y: 0, opacity: 1 },
          hover: { y: -20, opacity: 0 },
        }}
        initial="initial"
        animate={controls1}
        transition={{ duration: 0.3 }}
      >
        G2X ID
      </motion.p>
      <motion.p
        className="text-lg font-semibold text-gray-900"
        variants={{
          initial: { y: 0, color: "#1f2937", scale: 1 },
          hover: { y: -20, color: "#ffffff", scale: 1.2 },
        }}
        initial="initial"
        animate={controls2}
        transition={{ duration: 0.3 }}
      >
        {catalystId}
      </motion.p>
      <motion.p
        className="text-sm font-medium text-gray-700 cursor-pointer"
        variants={{
          initial: { y: 20, opacity: 0 },
          hover: { y: 0, opacity: 1, color: "#ffffff" },
        }}
        initial="initial"
        animate={controls3}
        transition={{ duration: 0.3 }}
        onClick={() => catalystId && handleTalentIDLearnMore(catalystId)}
      >
        What's this?
      </motion.p>
    </motion.div>
  );
}