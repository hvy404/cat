import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertProps {
  message: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, isMinimized, onToggleMinimize }) => {
  return (
    <div className="relative" style={{ height: '16px' }}>
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ width: 16, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 16, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-blue-50 shadow-sm rounded-full overflow-hidden border border-blue-100 absolute left-0 top-0 flex items-center"
            style={{ maxWidth: '250px', minHeight: '16px' }}
          >
            <div className="w-4 h-4 rounded-full bg-blue-400 flex-shrink-0" />
            <p className="text-blue-700 text-xs font-medium px-2">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div 
        className={`w-4 h-4 rounded-full bg-blue-400 cursor-pointer absolute left-0 top-0 ${isMinimized ? '' : 'z-10'}`}
        onClick={onToggleMinimize}
      />
    </div>
  );
};

export default Alert;