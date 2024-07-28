import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Info, LucideIcon, Map, Clock, Star } from 'lucide-react';
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

export default function PersonalProfile() {
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Personal Profile</h1>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Your public profile is crucial for matching you with federal contracting opportunities. Keep your information up-to-date to improve your chances of finding the perfect placement.
        </p>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="personal" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Personal Info</TabsTrigger>
            <TabsTrigger value="security" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Security Clearance</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs data-[state=active]:bg-gray-600 data-[state=active]:text-white">Optimization Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <TabContent
              title="Personal Information"
              description="Key details for your profile"
              features={[
                {
                  icon: User,
                  title: "Identification",
                  description: "Your name is how you'll be identified to potential employers."
                },
                {
                  icon: Info,
                  title: "Contact Information",
                  description: "Your email is the primary method for employers to contact you."
                },
                {
                  icon: Map,
                  title: "Location",
                  description: "City, State, and Zip are highly recommended as employers often search by location."
                },
                {
                  icon: Star,
                  title: "Professional Summary",
                  description: "A brief introduction of your skills and experience helps you stand out to employers."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="security">
            <TabContent
              title="Security Clearance"
              description="Essential for many federal positions"
              features={[
                {
                  icon: Shield,
                  title: "Clearance Level",
                  description: "Select your current clearance level accurately."
                },
                {
                  icon: Info,
                  title: "Status Updates",
                  description: "Update promptly if your clearance status changes."
                },
                {
                  icon: User,
                  title: "Opportunity Matching",
                  description: "Your clearance information helps match you with appropriate opportunities."
                },
                {
                  icon: Clock,
                  title: "Clearance Validity",
                  description: "Ensure your clearance is current and valid for better matching with available positions."
                }
              ]}
            />
          </TabsContent>

          <TabsContent value="tips">
            <TabContent
              title="Profile Optimization Tips"
              description="Maximize your chances of finding opportunities"
              features={[
                {
                  icon: User,
                  title: "Professional Presentation",
                  description: "Use a professional email address and double-check all entered information for accuracy."
                },
                {
                  icon: Info,
                  title: "Regular Updates",
                  description: "Keep your profile current with your latest skills and clearances."
                },
                {
                  icon: Shield,
                  title: "Clearance Accuracy",
                  description: "Ensure your security clearance information is always up-to-date for better matching."
                },
                {
                  icon: Star,
                  title: "Highlight Achievements",
                  description: "Include notable certifications to make your profile stand out to potential employers."
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}