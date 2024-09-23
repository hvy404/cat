import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import getFetchSuggestionRoles from "./role-suggestions";
import { getCompleteTalentProfile, TalentProfile } from "./get-data";
import ResumeBuilder from "./builder";
import { Item } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter";
import { toast } from "sonner";

export default function CandidateResumeCopilot() {
  const { user: clerkUser } = useUser();
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [potentialRoles, setPotentialRoles] = useState<string[] | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;

  useEffect(() => {
    const fetchSuggestionRoles = async () => {
      if (candidateId) {
        try {
          const result = await getFetchSuggestionRoles(candidateId);
          //console.log("Suggestion Roles:", result);

          if (result.status === "success") {
            setPotentialRoles(result.potentialRoles);
            setRolesError(null);
          } else {
            setPotentialRoles(null);
            setRolesError(result.message || "Failed to fetch suggestion roles");
          }
        } catch (err) {
          //console.error("Error fetching suggestion roles:", err);
          setPotentialRoles(null);
          setRolesError("An unexpected error occurred while fetching roles");
        }
      }
    };

    fetchSuggestionRoles();
  }, [candidateId]);

  useEffect(() => {
    const fetchTalentProfile = async () => {
      if (candidateId) {
        setIsLoading(true);
        setError(null);
        try {
          const profile = await getCompleteTalentProfile(candidateId);
          setTalentProfile(profile);
          setShowRoleSelection(true); // Show role selection after profile is loaded
        } catch (err) {
          setError("Failed to fetch talent profile");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTalentProfile();
  }, [candidateId]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowRoleSelection(false);
  };

  const handleCustomRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customRole.trim()) {
      try {
        const isInappropriate = await contentModerationWordFilter(customRole.trim());
        if (isInappropriate) {
          toast.error("Sorry, I'm not able to help with that.");
        } else {
          handleRoleSelect(customRole.trim());
        }
      } catch (error) {
        console.error("Error in content moderation:", error);
        toast.error("An error occurred while processing your custom role.");
      }
    }
  };

  const handleSelectedItemsChange = (items: Item[]) => {
    setSelectedItems(items);
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Resume Coach
            {selectedRole && (
              <span className="ml-2 text-md font-semibold text-gray-600 mb-4">
                - {selectedRole}
              </span>
            )}
          </h2>
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-6">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-600 text-center py-8"
                >
                  <Loader2 className="animate-spin h-12 w-12 mb-4 mx-auto text-gray-500" />
                  Loading talent profile...
                </motion.div>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-center py-4"
                >
                  {error}
                </motion.p>
              )}

              <AnimatePresence>
                {!isLoading && showRoleSelection && potentialRoles && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Select Your Desired Role
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {potentialRoles.map((role, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleRoleSelect(role)}
                            className="w-full h-full py-6 text-left justify-start text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200"
                            variant="outline"
                          >
                            {role}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <form onSubmit={handleCustomRoleSubmit} className="mt-8">
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          placeholder="Enter a custom role"
                          className="flex-grow"
                        />
                        <Button type="submit" variant="default">
                          Use Custom Role
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {rolesError && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-center py-4"
                >
                  There was an error, please refresh your page to try again.
                </motion.p>
              )}

              <AnimatePresence>
                {!showRoleSelection && selectedRole && talentProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >

                    {candidateId && (
                      <ResumeBuilder
                        talentProfile={talentProfile}
                        onSelectedItemsChange={handleSelectedItemsChange}
                        selectedItems={selectedItems}
                        selectedRole={selectedRole}
                        userId={candidateId}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
