import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Lightbulb, LucideIcon, RefreshCw, Target, Filter } from 'lucide-react';
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

export default function EnhancedSearchInfo() {
  return (
    <Card className="w-full mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Smart Search</h1>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Smart Search combines cutting-edge technology with your unique professional profile to uncover the perfect opportunities tailored just for you.
        </p>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">How It Works</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Smart Matching</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Search Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <TabContent
              title="Your Personal Job Explorer"
              description="Discover opportunities that align perfectly with your skills and aspirations."
              features={[
                {
                  icon: Search,
                  title: "Profile-Powered Search",
                  description: "Our algorithm uses your profile information to find highly relevant job opportunities."
                },
                {
                  icon: Zap,
                  title: "Tailored Results",
                  description: "See only the jobs that match your unique blend of skills and experience."
                },
                {
                  icon: Lightbulb,
                  title: "Continuous Learning",
                  description: "The more you interact, the smarter our search becomes at understanding your preferences."
                },
                {
                  icon: RefreshCw,
                  title: "Real-Time Updates",
                  description: "Receive instant notifications for new opportunities that match your evolving profile."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="ai">
            <TabContent
              title="AI-Driven Career Compass"
              description="Let our advanced technology guide you to your ideal professional path."
              features={[
                {
                  icon: Zap,
                  title: "Holistic Analysis",
                  description: "Our AI considers your entire professional story, from past experiences to future aspirations."
                },
                {
                  icon: Search,
                  title: "Vast Opportunity Database",
                  description: "We scan thousands of jobs to find the ones that truly resonate with your profile."
                },
                {
                  icon: Lightbulb,
                  title: "Adaptive Intelligence",
                  description: "Our platform evolves with you, continuously refining its understanding of your career goals."
                },
                {
                  icon: Target,
                  title: "Precision Matching",
                  description: "Advanced algorithms ensure each job recommendation is a potential perfect fit for your career trajectory."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="tips">
            <TabContent
              title="Maximize Your Search Potential"
              description="Unlock the full power of Smart Search with these expert strategies."
              features={[
                {
                  icon: Zap,
                  title: "Profile Optimization",
                  description: "Keep your profile current to give our AI the most accurate picture of your professional self."
                },
                {
                  icon: Search,
                  title: "Keyword Mastery",
                  description: "Experiment with different search terms to uncover hidden opportunities in your field."
                },
                {
                  icon: Lightbulb,
                  title: "Skill Spotlight",
                  description: "Highlight your unique skills to stand out in specific niche markets and industries."
                },
                {
                  icon: Filter,
                  title: "Smart Filtering",
                  description: "Utilize advanced filters to fine-tune your search results and discover your ideal positions."
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}