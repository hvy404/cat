import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Copy,
  CheckCircle,
  Zap,
  Rocket,
  Target,
  ShieldCheck,
  Star,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface G2XTalentIDPanelProps {
  talentID?: string;
  onBack: () => void;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <motion.div
    className="bg-gray-700 p-4 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05, backgroundColor: "#4A5568" }}
    transition={{ duration: 0.2 }}
  >
    <Icon className="text-yellow-400 mb-2" size={20} />
    <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
    <p className="text-gray-300 text-sm">{description}</p>
  </motion.div>
);

const UsageInfo = () => (
  <div className="bg-blue-900 p-4 rounded-lg shadow-lg text-white">
    <div className="flex items-start mb-2">
      <Info className="text-blue-300 mr-2 flex-shrink-0 mt-1" size={20} />
      <h4 className="text-base font-semibold">
        When to Use Your G2X Talent ID
      </h4>
    </div>
    <p className="text-sm text-blue-100">
      Your G2X Talent ID is only needed for external use. Use it when applying
      directly on participating employer websites. While on G2X Talent, your profile is
      automatically linked - no need to enter your ID!
    </p>
  </div>
);

export default function G2XTalentIDPanel({
  talentID,
  onBack,
}: G2XTalentIDPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    if (talentID) {
      navigator.clipboard
        .writeText(talentID)
        .then(() => {
          setCopied(true);
          toast.success(
            "G2X Talent ID copied! Your key to swift applications."
          );
          setTimeout(() => setCopied(false), 3000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error("Oops! Couldn't copy your supercharged ID. Try again!");
        });
    }
  };

  return (
    <div className="min-h-[90vh] h-full rounded-lg bg-gray-800 p-4 sm:p-6 overflow-auto text-white relative">
      <Button
        variant="link"
        size="sm"
        onClick={onBack}
        className="absolute top-2 left-2 text-gray-400"
      >
        <X className="mr-2 h-4 w-4" />
        Dismiss
      </Button>
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl space-y-6 sm:space-y-8"
        >
          <>
            <motion.div
              className="bg-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl w-full relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center relative z-10">
                <span className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {talentID}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyToClipboard}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                </motion.button>
              </div>
            </motion.div>

            <UsageInfo />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <FeatureCard
                icon={Rocket}
                title="Streamlined Applications"
                description="Skip lengthy forms on participating employer sites. Just enter your ID and you're done!"
              />
              <FeatureCard
                icon={Target}
                title="Smart Profile Matching"
                description="Our AI highlights the strengths in your professional story that best align with each job's unique requirements."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Credential Verification"
                description="Your G2X profile lends credibility to your applications, building trust with recruiters."
              />
              <FeatureCard
                icon={Star}
                title="Enhanced Visibility"
                description="Your comprehensive G2X profile helps you shine brighter in the applicant pool."
              />
            </div>
          </>
        </motion.div>
      </div>
    </div>
  );
}
