// AlertMessage.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from "@/components/ui/alert";
import { Info, X } from 'lucide-react';

interface AlertMessageProps {
  showAlert: boolean;
  dismissAlert: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ showAlert, dismissAlert }) => {
  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 px-3 relative">
            <button
              onClick={dismissAlert}
              className="absolute top-3 right-3 p-1 text-yellow-500 hover:text-yellow-700"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 pr-8">
              <Info className="h-6 w-6 flex-shrink-0 text-yellow-500" />
              <p className="text-xs text-yellow-700">
                This candidate discovered your job listing through our
                platform's search feature and submitted their resume to express
                interest. While our AI-driven matching algorithms excel at
                identifying ideal candidates, we encourage a thorough review of
                this self-submitted application to ensure alignment with your
                specific requirements.
              </p>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertMessage;