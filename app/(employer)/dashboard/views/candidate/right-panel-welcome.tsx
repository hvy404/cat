import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LeftArrowGraphic } from "@/app/(employer)/dashboard/views/candidate/assets/left-arrow";

export default function CandidateDashboardRightPanelWelcome() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [showNextBox, setShowNextBox] = useState(false);

  useEffect(() => {
    if (isAnimated) {
      const nextBoxTimer = setTimeout(() => setShowNextBox(true), 1500);
      return () => clearTimeout(nextBoxTimer);
    }
  }, [isAnimated]);

  const handleAnimationStart = () => {
    setIsAnimated(true);
  };

  const variants = {
    center: {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      fontSize: "1.875rem",
    },
    topLeft: {
      top: "0rem",
      left: "0rem",
      x: "0%",
      y: "0%",
      fontSize: "1.125rem",
    },
  };

  const nextBoxVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative h-full w-full p-4">
      <motion.div
        className="absolute whitespace-nowrap"
        initial="center"
        animate={isAnimated ? "topLeft" : "center"}
        variants={variants}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
       <motion.div
          className={`font-merriweather text-gray-600 font-medium ${!isAnimated ? 'text-center' : ''}`}
        >
          <p>Hello, Huy 👋</p>
          <p>You're in good hands.</p>
        </motion.div>
        {!isAnimated && (
        <div className="w-full mt-8 flex justify-center">
          <Button onClick={handleAnimationStart}>How does it work?</Button>
        </div>
      )}
      </motion.div>
      
      

      <AnimatePresence>
        {showNextBox && (
          <motion.div
            className="absolute text-gray-500 mt-8 w-full"
            style={{ top: "calc(0rem + 3.5em)", left: "0rem" }}
            variants={nextBoxVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-rows-3 gap-4 w-full">
              <div className="border border-gray-200 text-gray-600 rounded-md p-4">
                <h3 className="font-medium">How It Works</h3>
                <p className="text-sm leading-6">
                  Your unique profile becomes the foundation for a sophisticated
                  matching process. Leveraging advanced artificial intelligence,
                  the system analyzes your skills, experience, and aspirations
                  to identify the most suitable job opportunities in the federal
                  government space. This approach goes beyond simple keyword
                  matching to find positions that truly align with your
                  professional profile.
                </p>
              </div>
              <div className="border border-gray-200 text-gray-600 rounded-md p-4">
                <h3 className="font-medium">Quality Matches</h3>
                <p className="text-sm leading-6">
                  Behind the scenes, intricate machine learning algorithms
                  process hundreds of criteria and preferences to deliver
                  high-quality matches. The system takes into account not just
                  your technical skills, but also your soft skills, career
                  goals, and workplace preferences. This comprehensive approach
                  aims to uncover opportunities where you're most likely to
                  thrive and succeed.
                </p>
              </div>
              <div className="border border-gray-200 text-gray-600 rounded-md p-4">
                <h3 className="font-medium">Next Steps</h3>
                <p className="text-sm leading-6">
                  To enhance your match results, take a moment to verify and
                  enrich your profile information. The more complete and
                  accurate your profile, the better the AI can understand your
                  unique professional story. This ensures that the matching
                  process reflects the full spectrum of your talents and
                  aspirations, leading to more tailored job recommendations.
                </p>
              </div>
            </div>
            <div className="flex flex-row relative w-1/2 justify-end h-24">
              <LeftArrowGraphic />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}