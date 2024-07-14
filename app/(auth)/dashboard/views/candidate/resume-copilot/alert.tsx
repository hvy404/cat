import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertProps {
  message: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, isMinimized, onToggleMinimize }) => {
  return (
    <div className="w-full">
      <AnimatePresence>
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-4 h-4 rounded-full bg-green-400 cursor-pointer ml-2 mb-2"
            onClick={onToggleMinimize}
          />
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 shadow-sm rounded-lg overflow-hidden border border-green-100 mb-2"
          >
            <div className="flex items-start p-2">
              <div 
                className="w-4 h-4 rounded-full bg-green-400 cursor-pointer flex-shrink-0 mt-0.5 mr-2"
                onClick={onToggleMinimize}
              />
              <p className="text-green-700 text-xs font-medium flex-grow">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alert;