import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Check, LucideIcon, Bookmark, Target, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface IconWrapperProps {
  children: React.ReactNode;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children }) => (
  <div className="p-2 bg-gray-100 rounded-full">
    {children}
  </div>
);

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, description }) => (
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

const TabContent: React.FC<TabContentProps> = ({ title, description, features }) => (
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

export default function CertificationGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Certification Guide</h1>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Understand the importance of certifications in your job search and how to leverage them effectively.
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="importance" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Importance</TabsTrigger>
            <TabsTrigger value="usage" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">How We Use</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TabContent
              title="Certification Overview"
              description="Why certifications matter in your job search"
              features={[
                {
                  icon: AlertCircle,
                  title: "Demonstrate Expertise",
                  description: "Showcase your skills and commitment to professional development."
                },
                {
                  icon: Award,
                  title: "Increase Visibility",
                  description: "Stand out to potential employers in the professional and government contractor space."
                },
                {
                  icon: TrendingUp,
                  title: "Career Advancement",
                  description: "Open doors to new opportunities and higher-level positions in your field."
                },
                {
                  icon: Bookmark,
                  title: "Industry Recognition",
                  description: "Gain acknowledgment from industry leaders and peers for your expertise."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="importance">
            <TabContent
              title="Which Certifications to Add"
              description="Focus on quality and relevance when choosing certifications"
              features={[
                {
                  icon: Award,
                  title: "Relevance is Key",
                  description: "Prioritize certifications that align with your target job roles and industry."
                },
                {
                  icon: Check,
                  title: "Recognized and Current",
                  description: "Add certifications from reputable organizations that are up-to-date."
                },
                {
                  icon: AlertCircle,
                  title: "Quality Over Quantity",
                  description: "A few highly relevant certifications are more valuable than many unrelated ones."
                },
                {
                  icon: Target,
                  title: "Industry Demand",
                  description: "Focus on certifications that are in high demand within your target industry."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="usage">
            <TabContent
              title="How We Use Your Certifications"
              description="Leveraging your certifications in job matching"
              features={[
                {
                  icon: Check,
                  title: "AI-Powered Matching",
                  description: "Our algorithm considers your certifications when recommending job opportunities."
                },
                {
                  icon: AlertCircle,
                  title: "Candidate Filtering",
                  description: "We use certifications to help employers find the most qualified candidates."
                },
                {
                  icon: Award,
                  title: "Opportunity Enhancement",
                  description: "We may suggest additional certifications to boost your job prospects."
                },
                {
                  icon: Zap,
                  title: "Skill Gap Analysis",
                  description: "We identify potential skill gaps and recommend relevant certifications to fill them."
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}