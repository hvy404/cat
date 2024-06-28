import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, UserPlus, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecommendationCardProps {
    title: string;
    items: string[];
    icon: React.ElementType;
  }
  
  export const RecommendationCard: React.FC<RecommendationCardProps> = ({
    title,
    items,
    icon: Icon,
  }) => (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <Icon className="w-4 h-4 text-gray-700" />
        <CardTitle className="text-md font-semibold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="w-1 h-1 rounded-full bg-gray-500 mr-2 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
        <Button variant="outline" size="sm" className="w-full text-sm">
          Take Action
        </Button>
      </CardFooter>
    </Card>
  );