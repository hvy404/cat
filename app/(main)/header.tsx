"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

export function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/global/logo_mono_dark.png"
              alt="G2X Talent"
              width={90}
              height={24}
              className="h-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/hire">For Employers</NavLink>
            <NavLink href="/pricing">Privacy</NavLink>
            <NavLink href="/about">How It Works?</NavLink>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Sign Up{" "}
                </Button>
              </SignInButton>
            ) : (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "w-10 h-10 rounded-full border-2 border-purple-500 hover:border-indigo-500 transition-all duration-300",
                  },
                }}
              />
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-lg rounded-b-2xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-2">
              <MobileNavLink href="/hire">For Employers</MobileNavLink>
              <MobileNavLink href="/pricing">Privacy</MobileNavLink>
              <MobileNavLink href="/about">How It Works?</MobileNavLink>
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-md transition-all duration-300"
                >
                  Sign Up
                </Button>
              </SignInButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <Link href={href} className="relative group">
    <span className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-900 transition-colors duration-200">
      {children}
    </span>
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
  </Link>
);

const MobileNavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <Link
    href={href}
    className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
  >
    <span className="text-base font-medium">{children}</span>
    <ChevronDown className="h-4 w-4 text-gray-400" />
  </Link>
);

export default MainHeader;
