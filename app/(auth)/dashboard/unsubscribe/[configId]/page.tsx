"use client";

import { FC } from "react";
import { ArrowLeft, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { updateEmployerEmailSettings } from "@/lib/notification-sender/unsubscribe";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UnsubscribePageProps {
  params: {
    configId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const UnsubscribePage: FC<UnsubscribePageProps> = ({
  params,
  searchParams,
}) => {
  const { configId } = params;
  const { user: clerkUser, isLoaded } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;
  const type = searchParams.type as "match" | "app" | undefined;

  const email = decodeURIComponent(configId);

  const handleUnsubscribe = async () => {
    if (cuid && type && (type === "match" || type === "app")) {
      try {
        await updateEmployerEmailSettings(cuid, type);
        toast.success("You have been unsubscribed");
      } catch (error) {
        toast.error("An error occurred unsubscribing. Please try again later.");
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-semibold text-gray-800">Loading...</p>
      </div>
    );
  }

  const getUnsubscribeTitle = () => {
    if (type === "app") {
      return "Unsubscribe from Application Notifications";
    } else if (type === "match") {
      return "Unsubscribe from Match Notifications";
    }
    return "Unsubscribe from Notifications";
  };

  const getBenefitMessage = () => {
    if (type === "app") {
      return "Application notifications keep you informed about interested candidates. They help you stay on top of your recruitment process and ensure you don't miss out on potential talent.";
    } else if (type === "match") {
      return "Match notifications connect you with AI-selected candidates that fit your job requirements. They save you time and help you discover qualified candidates you might otherwise miss.";
    }
    return "Our notifications are designed to streamline your recruitment process and help you find the best talent efficiently.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
            {getUnsubscribeTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We value your preferences
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-md">
              <p className="text-sm text-gray-700">{email}</p>
            </div>
          </div>

          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {getBenefitMessage()}
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/dashboard"
                className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <button
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={handleUnsubscribe}
            >
              Unsubscribe
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-gray-600">G2X Talent</p>
      </div>
    </div>
  );
};

export default UnsubscribePage;
