import React from "react";
import { motion } from "framer-motion";
import {
  Book,
  GraduationCap,
  Compass,
  LucideIcon,
  Award,
  Target,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface IconWrapperProps {
  children: React.ReactNode;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children }) => (
  <div className="p-2 bg-gray-100 rounded-full">{children}</div>
);

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full">
    <IconWrapper>
      <Icon className="w-5 h-5 text-gray-600" />
    </IconWrapper>
    <div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

interface TabContentProps {
  title: string;
  description: string;
  features: FeatureProps[];
}

const TabContent: React.FC<TabContentProps> = ({
  title,
  description,
  features,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">{description}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="h-full"
        >
          <Feature {...feature} />
        </motion.div>
      ))}
    </div>
  </div>
);

export default function EducationManagement() {
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Education Management
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Effectively manage and showcase your educational background to enhance
          your professional profile and career opportunities.
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              What to Include
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              Personal Growth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TabContent
              title="Importance of Education"
              description="Understand why your educational background matters in your professional journey."
              features={[
                {
                  icon: Book,
                  title: "Demonstrate Qualifications",
                  description:
                    "Showcase your academic achievements and knowledge base to potential employers.",
                },
                {
                  icon: GraduationCap,
                  title: "Career Context",
                  description:
                    "Provide context for your career trajectory and professional development.",
                },
                {
                  icon: Compass,
                  title: "Continuous Learning",
                  description:
                    "Highlight your commitment to learning and self-improvement throughout your career.",
                },
                {
                  icon: Briefcase,
                  title: "Industry Relevance",
                  description:
                    "Illustrate how your educational background relates to current industry trends and demands.",
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="details">
            <TabContent
              title="Essential Elements"
              description="Key components to include in your educational profile for maximum impact."
              features={[
                {
                  icon: GraduationCap,
                  title: "Degree Information",
                  description:
                    "Include degree name, institution, graduation date, and relevant coursework.",
                },
                {
                  icon: Book,
                  title: "Academic Achievements",
                  description:
                    "Highlight honors, awards, and significant projects or research.",
                },
                {
                  icon: Compass,
                  title: "Skills Acquired",
                  description:
                    "Emphasize key skills and knowledge gained through your educational experiences.",
                },
                {
                  icon: Target,
                  title: "Extracurricular Activities",
                  description:
                    "Showcase leadership roles, clubs, or volunteer work that complement your academic profile.",
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="growth">
            <TabContent
              title="Personal Development"
              description="Reflect on how your education has shaped your professional growth and future goals."
              features={[
                {
                  icon: Compass,
                  title: "Career Alignment",
                  description:
                    "Consider how your academic background aligns with your desired career path.",
                },
                {
                  icon: Book,
                  title: "Skill Application",
                  description:
                    "Identify ways to apply your academic knowledge to real-world challenges.",
                },
                {
                  icon: GraduationCap,
                  title: "Lifelong Learning",
                  description:
                    "Embrace the value of continuous education in your professional journey.",
                },
                {
                  icon: Target,
                  title: "Goal Setting",
                  description:
                    "Use your educational experiences to inform and shape your future career objectives.",
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
