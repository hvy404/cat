import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    <span className="text-lg font-medium text-gray-500">Loading...</span>
  </div>
);

const LoadingExperienceCard = () => (
  <div className="border border-gray-100/80 p-4 rounded-md space-y-4 animate-pulse">
    <div className="h-6 bg-gray-100/80 rounded w-3/4"></div>
    <div className="h-4 bg-gray-100/80 rounded w-1/2"></div>
    <div className="h-16 bg-gray-100/80 rounded"></div>
  </div>
);

const LoadingState = () => (
  <div className="space-y-8">
    <LoadingSpinner />
    <div className="space-y-6">
      <LoadingExperienceCard />
    </div>
  </div>
);

export default LoadingState;