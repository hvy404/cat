"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  Brain,
  Search,
  FileText,
  Briefcase,
  Users,
  BarChart,
} from "lucide-react";
import useStore from "@/app/state/useStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createCheckoutSession } from "@/lib/stripe/init";

interface Feature {
  text: string;
  superscript: string;
  tooltip: string;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: (string | Feature)[];
  cta: string;
  recommended?: boolean;
  priceId: string;
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function EmployerDashboardUpgrade() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();
  const [loadingStates, setLoadingStates] = useState({
    monthly: false,
    annual: false,
  });
  const [loading, setLoading] = useState(false);

  const aiPoweredExplanationShort =
    "Active AI-driven recruitment campaigns. Flexible allocation between AI-powered and traditional job postings.";

  const aiPoweredExplanationFull =
    "AI-Powered Talent Searches represent your active, AI-driven recruitment campaigns. This is not a one-time use credit, but an ongoing allocation. You have the flexibility to switch jobs between AI-powered and traditional posting modes. When you pause AI matching for a job, it automatically becomes a standard job listing, freeing up that AI-Powered Talent Search slot for another position. This allows you to dynamically allocate your AI resources to your most critical hiring needs.";

  const plans: Plan[] = [
    {
      name: "Monthly",
      price: "$450",
      period: "per month",
      features: [
        "AI-Powered Matching",
        {
          text: "100 Active AI-Powered Talent Searches",
          superscript: "1",
          tooltip: aiPoweredExplanationShort,
        },
        {
          text: "Unlimited Job Board Postings",
          superscript: "2",
          tooltip: "Traditional job postings for candidate applications",
        },
        "Continuous Matching",
        "AI Candidate Analysis",
        "Job Descriptions Copilot",
        "Diverse Talent Network",
        "Lite ATS",
        "Advanced Candidate Search",
        "SOW Analysis",
        "Instant Notifications",
      ],
      cta: "Start Monthly Plan",
      priceId: "price_1Q1G5pECD1UabPVRY5H7JTSc",
    },
    {
      name: "Annual",
      price: "$4,500",
      period: "per year",
      features: [
        "All Monthly Plan features",
        {
          text: `200 Active AI-Powered Talent Searches`,
          superscript: "1",
          tooltip: aiPoweredExplanationShort,
        },
        "2 months free",
        "Priority match processing",
      ],
      cta: "Start Annual Plan",
      recommended: true,
      priceId: "price_1Q1Xz8ECD1UabPVRYENPvNlM",
    },
  ];

  const features: FeatureItem[] = [
    {
      icon: <Brain />,
      title: "AI-Powered Matching",
      description:
        "Our advanced algorithm finds the perfect candidates for your roles.",
    },
    {
      icon: <FileText />,
      title: "Job Descriptions Copilot",
      description:
        "Create compelling job postings with our AI to attract top talent.",
    },
    {
      icon: <Users />,
      title: "Diverse Talent Network",
      description:
        "Access candidates vetted for both federal and private sector requirements.",
    },
    {
      icon: <Briefcase />,
      title: "Lite ATS",
      description:
        "Manage your hiring process end-to-end with our lightweight ATS.",
    },
    {
      icon: <Search />,
      title: "Advanced Candidate Search",
      description:
        "Find the right talent with powerful search and filtering options.",
    },
    {
      icon: <BarChart />,
      title: "SOW Analysis",
      description:
        "Generate job descriptions from Statements of Work for complex projects.",
    },
  ];

  const legendItems = [
    {
      superscript: "1",
      explanation: aiPoweredExplanationFull,
    },
    {
      superscript: "2",
      explanation:
        "Post jobs to our traditional job board for candidate applications",
    },
  ];

  const handleSubscription = async (
    priceId: string,
    planType: "monthly" | "annual"
  ) => {
    setLoadingStates((prev) => ({ ...prev, [planType]: true }));
    try {
      const result = await createCheckoutSession(priceId);
      if ("error" in result) {
        throw new Error(result.error);
      }
      window.location.href = result.url;
    } catch (error) {
      console.error("Error:", error);
      // Handle the error, maybe show a notification to the user
    } finally {
      setLoadingStates((prev) => ({ ...prev, [planType]: false }));
    }
  };

  return (
    <TooltipProvider>
      <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
        <div
          className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
            isExpanded ? "lg:w-3/4" : "lg:w-1/2"
          }`}
        >
          <div className="flex justify-between gap-6 rounded-lg border p-4">
            <h2 className="font-bold text-md leading-6 text-gray-900">
              Revolutionize Your Hiring Process
            </h2>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden transition-all duration-300 flex flex-col ${
                    plan.recommended
                      ? "border-indigo-300 shadow-md"
                      : "border-gray-200"
                  } hover:shadow-lg`}
                >
                  <CardHeader
                    className={`bg-gradient-to-r ${
                      plan.recommended
                        ? "from-indigo-500 to-indigo-600"
                        : "from-gray-100 to-gray-200"
                    } ${plan.recommended ? "text-white" : "text-gray-800"}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      {plan.recommended && (
                        <Badge
                          variant="secondary"
                          className="bg-white text-indigo-600"
                        >
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <div className="mb-4">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check
                            className="text-green-500 mr-2 flex-shrink-0 mt-1"
                            size={16}
                          />
                          <span className="text-sm">
                            {typeof feature === "string" ? (
                              feature
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    {feature.text}
                                    <sup className="text-xs text-indigo-600 ml-0.5">
                                      {feature.superscript}
                                    </sup>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="p-3 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                                  <p className="max-w-xs">{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      className={`w-full transition-colors duration-300 ${
                        plan.recommended
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        handleSubscription(
                          plan.priceId,
                          plan.name.toLowerCase() as "monthly" | "annual"
                        )
                      }
                      disabled={
                        loadingStates[
                          plan.name.toLowerCase() as "monthly" | "annual"
                        ]
                      }
                    >
                      {loadingStates[
                        plan.name.toLowerCase() as "monthly" | "annual"
                      ]
                        ? "Processing..."
                        : plan.cta}{" "}
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-1">
                {legendItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <sup className="text-xs text-indigo-600 mr-2 mt-1">
                      {item.superscript}
                    </sup>
                    <span className="text-sm text-gray-600">
                      {item.explanation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div
          className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
            isExpanded ? "lg:w-1/4" : "lg:w-1/2"
          }`}
        >
          <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
            <h3 className="font-bold text-lg mb-4 text-gray-900">
              Key Features
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="transition-all duration-300 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        {React.cloneElement(
                          feature.icon as React.ReactElement,
                          {
                            className: "h-5 w-5 text-indigo-600",
                          }
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
