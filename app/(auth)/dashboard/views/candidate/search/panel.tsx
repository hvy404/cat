import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, UserCheck, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface SectionProps {
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ElementType;
}

const Section: React.FC<SectionProps> = ({ title, description, content, icon: Icon }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
    <CardHeader className="flex flex-row items-center space-x-2 pb-2">
      <Icon className="w-5 h-5 text-gray-700" />
      <div>
        <CardTitle className="text-md font-semibold text-gray-800">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      {content}
    </CardContent>
  </Card>
);

export default function RightPanelSearchInfo() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Smart Search</h1>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        While our AI-powered matching is at the core of our platform, we understand that sometimes you want to take the reins. Use our Smart Search to explore opportunities tailored to your professional profile.
      </p>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="search" className="text-sm">How It Works</TabsTrigger>
          <TabsTrigger value="ai" className="text-sm">Smart Matching</TabsTrigger>
          <TabsTrigger value="tips" className="text-sm">Search Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="search"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Smart Search: Your Personal Job Explorer"
                  description="Discover opportunities that fit you"
                  icon={Search}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Our Smart Search is like having a personal career assistant:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>It uses the information from your profile to find relevant job opportunities</li>
                        <li>When you search, you're not seeing every job out there - just the ones that could be a good match for you</li>
                        <li>The more complete your profile, the better your search results will be</li>
                      </ul>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="ai"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Smart Matching: Your Career Compass"
                  description="How our technology finds your perfect fit"
                  icon={Zap}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Our smart technology works behind the scenes to help you:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>It looks at your whole professional story - your skills, experience, and what you want for your future</li>
                        <li>Then, it searches through tons of jobs to find the ones that fit you best</li>
                        <li>The more you use our platform, the better it gets at understanding what you're looking for</li>
                      </ul>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="tips">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="tips"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Search Like a Pro"
                  description="Get the most out of your job search"
                  icon={Lightbulb}
                  content={
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Keep your profile up-to-date - it's like giving our smart search a better map to find your dream job</li>
                      <li>Try different search terms - if "Marketing Manager" doesn't show what you want, try "Brand Strategist" or "Digital Marketing"</li>
                      <li>Use specific skills in your search - especially for those unique abilities you bring to the table</li>
                      <li>Don't see what you're looking for? New opportunities are added all the time, so check back often</li>
                      <li>Remember, while you're searching, our smart technology is also working to bring opportunities to you</li>
                    </ul>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
     
    </div>
  );
}