import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Briefcase, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const tips = {
  default: {
    title: "Your Candidate Dashboard",
    icon: Info,
    content: [],
  },
  resumes: {
    title: "Resume Preferences",
    icon: Briefcase,
    content: [
      {
        title: "Default Resume",
        description:
          "Choose your star player! Your default resume is the one we'll show to employers when our AI finds a great job match for you. Think of it as your main resume that represents your overall skills and experience. You can change this anytime, so don't worry about picking the 'perfect' one right away.",
      },
      {
        title: "Automatic Sharing",
        description:
          "Let your resume do the talking! When our smart system finds a job that fits you like a glove, we'll automatically share your default resume with the employer. This means you could get considered for amazing opportunities without lifting a finger. It's like having a personal agent working for you 24/7!",
      },
      {
        title: "Manual Applications",
        description:
          "You're in control! When you decide to apply for a specific job yourself, you're not limited to your default resume. You can choose any resume you've uploaded to put your best foot forward. This flexibility allows you to tailor your application to each unique opportunity.",
      },
      {
        title: "Keep Updated",
        description:
          "Your career is always evolving, and your resume should too! Regularly updating your default resume ensures that employers see your latest skills and achievements. It's like giving your professional story a fresh coat of paint. Plus, keeping it current helps our AI find even better matches for you. A win-win!",
      },
      {
        title: "Resume Variety",
        description:
          "Variety is the spice of life - and job searches! Having multiple resumes allows you to showcase different aspects of your career. You might have one that focuses on your technical skills, another that highlights your leadership experience, and so on. This versatility can be super helpful when you're exploring diverse career opportunities.",
      },
    ],
  },
  preferences: {
    title: "Your Experience",
    icon: Settings,
    content: [
      {
        title: "Job Matching",
        description:
          "Our AI technology finds jobs that fit your skills and career goals. When you turn this on, we'll use your profile and resume to suggest jobs you might like. It's like having a personal job scout working for you 24/7!",
      },
      {
        title: "Notifications",
        description:
          "Stay in the loop with email alerts. We can let you know about new job matches, application updates, and important account information. You control how often you hear from us, so you're always informed but never overwhelmed.",
      },
      {
        title: "Interview Invitations",
        description:
          "Employers can invite you to interviews directly through our platform. When you enable this, you'll be notified if an employer wants to interview you. Don't worry, you can always choose whether to accept or decline these invitations.",
      },
      {
        title: "Privacy Control",
        description:
          "Your privacy matters. These settings let you decide how visible your profile is to employers and how much information we share. You're in control of your job search experience every step of the way.",
      },
    ],
  },
};

interface SidePanelProps {
  activeInfo: "default" | "resumes" | "preferences";
}

export default function SidePanel({ activeInfo }: SidePanelProps) {
  const activeTip = tips[activeInfo];
  const IconComponent = activeTip.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeInfo}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6 h-full flex flex-col">
          {activeInfo === "default" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full space-y-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center"
              >
                <Info className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-slate-800 text-center">
                My Preferences
              </h1>
              <p className="text-md text-slate-600 text-center max-w-md">
                Configure your candidate journey and optimize your job search
                experience.
              </p>
              <Alert className="mt-8 bg-blue-50 border-blue-200 max-w-[480px]">
                <AlertDescription className="text-blue-700 text-center">
                  Click the icons on the left to learn more about each section.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="p-2 bg-slate-100 rounded-full">
                  <IconComponent className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {activeTip.title}
                </h3>
              </motion.div>
              <motion.div
                className="flex-grow"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {activeTip.content.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 last:mb-0"
                  >
                    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="text-base font-semibold text-slate-700 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
