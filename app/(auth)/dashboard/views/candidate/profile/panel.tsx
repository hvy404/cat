import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Info, ChevronRight } from 'lucide-react';
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
        Edit <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter> */}
  </Card>
);

export default function ProfileManagement() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Profile Management</h1>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        Your public profile is crucial for matching you with federal contracting opportunities. Keep your information up-to-date to improve your chances of finding the perfect placement.
      </p>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="personal" className="text-sm">Personal Info</TabsTrigger>
          <TabsTrigger value="security" className="text-sm">Security Clearance</TabsTrigger>
          <TabsTrigger value="tips" className="text-sm">Optimization Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="personal"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Personal Information"
                  description="Key details for your profile"
                  icon={User}
                  content={
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Name: How you'll be identified to potential employers</li>
                      <li>Email: Your primary contact method for opportunities</li>
                      <li>Location (City, State, Zip): Highly recommended as employers often search by location</li>
                      <li>Ensure all information is accurate and professional</li>
                    </ul>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="security"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Security Clearance"
                  description="Essential for many federal positions"
                  icon={Shield}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Your security clearance level is crucial for many positions:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Select your current clearance level accurately</li>
                        <li>Update promptly if your clearance status changes</li>
                        <li>This information helps match you with appropriate opportunities</li>
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
                  title="Profile Optimization Tips"
                  description="Maximize your chances of finding opportunities"
                  icon={Info}
                  content={
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Use a professional email address</li>
                      <li>Double-check all entered information for accuracy</li>
                      <li>Regularly update your profile to reflect current skills and clearances</li>
                      <li>Employers often have strict placement criteria; the more complete your profile, the better your chances of matching</li>
                      <li>Ensure your security clearance information is always up-to-date</li>
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