import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SlidingBulletMessage = ({
  message,
  isVisible,
  onDismiss,
}: {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 right-0 top-0 bg-red-500 text-white p-4 rounded-t-2xl shadow-lg z-0"
        >
          <div className="flex justify-between items-center">
            <p>{message}</p>
            <button
              onClick={onDismiss}
              className="text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlidingBulletMessage;