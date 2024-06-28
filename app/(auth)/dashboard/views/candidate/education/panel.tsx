import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, GraduationCap, Compass, ChevronRight } from 'lucide-react';
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
  {/*   <CardFooter className="pt-2 mt-auto">
      <Button variant="ghost" size="sm" className="w-full text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100">
        Learn More <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter> */}
  </Card>
);

export default function EducationManagement() {
  return (
    <div className="w-full p-6 bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Education Management</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="details" className="text-sm">What to Include</TabsTrigger>
          <TabsTrigger value="growth" className="text-sm">Personal Growth</TabsTrigger>
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
                  title="Importance of Education"
                  description="Why your educational background matters"
                  icon={Book}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Your educational background is a crucial part of your professional profile. Here's why it's important:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Demonstrates your academic qualifications and knowledge base</li>
                        <li>Highlights your commitment to learning and self-improvement</li>
                        <li>Can be a key differentiator for certain job roles</li>
                        <li>Provides context for your career trajectory</li>
                      </ul>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="details"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="What to Include"
                  description="Essential elements for your educational profile"
                  icon={GraduationCap}
                  content={
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>For each educational entry, include:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Degree or certification name</li>
                        <li>Institution name</li>
                        <li>Graduation date (or expected graduation date)</li>
                        <li>Relevant coursework, projects, or thesis topics</li>
                        <li>Academic achievements or honors</li>
                      </ul>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              <motion.div
                key="growth"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Section
                  title="Personal Growth and Career Development"
                  description="Reflecting on your educational journey"
                  icon={Compass}
                  content={
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Reflect on how your education has shaped your professional goals</li>
                      <li>Identify key skills and knowledge you've gained through your studies</li>
                      <li>Consider how your educational experiences have influenced your work ethic and approach to challenges</li>
                      <li>Think about how your academic background aligns with your desired career path</li>
                      <li>Recognize the value of both formal education and lifelong learning in your professional journey</li>
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