import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Award, Check, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
{/*     <CardFooter className="pt-2 mt-auto">
      <Button variant="ghost" size="sm" className="w-full text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100">
        Learn More <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter> */}
  </Card>
);

export default function RightPanel() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Certification Guide</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="importance" className="text-sm">Importance</TabsTrigger>
          <TabsTrigger value="usage" className="text-sm">How We Use</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="overview"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Certification Overview"
                  description="Why certifications matter in your job search"
                  icon={AlertCircle}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Adding relevant certifications to your profile helps us match you with the best job opportunities in the professional and government contractor space.</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Demonstrates your expertise and commitment</li>
                        <li>Increases visibility to potential employers</li>
                        <li>Can lead to higher-paying job opportunities</li>
                        <li>Validates your skills in specific areas</li>
                      </ul>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="importance">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="importance"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Which Certifications to Add"
                  description="Focus on quality and relevance"
                  icon={Award}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Focus on adding certifications that are:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Relevant to your target job roles</li>
                        <li>Recognized in your industry</li>
                        <li>Current and not expired</li>
                        <li>From reputable organizations</li>
                      </ul>
                      <p>Quality over quantity: It's better to have a few highly relevant certifications than many unrelated ones.</p>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="usage"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="How We Use Your Certifications"
                  description="Leveraging your certifications in job matching"
                  icon={Check}
                  content={
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Our AI-powered matching algorithm considers your certifications when recommending job opportunities</li>
                      <li>We use certifications to filter candidates for employers</li>
                      <li>We may suggest additional certifications that could enhance your opportunities</li>
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