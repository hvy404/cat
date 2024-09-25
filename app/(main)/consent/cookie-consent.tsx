"use client";
import React, { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="bg-white/80 backdrop-blur-lg shadow-lg border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                <Cookie className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    We use cookies to enhance your browsing experience and serve
                    peronalized experience. By clicking "Accept", you
                    consent to our use of cookies as described in our{" "}
                    <a
                      href="/cookies"
                      className="text-blue-600 hover:underline"
                    >
                      Cookie Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={acceptCookies}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Accept
                </Button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
