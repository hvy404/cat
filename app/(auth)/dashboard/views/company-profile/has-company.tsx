import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployerCompanyCheckProps {
  setIsCreatingCompany: (value: boolean) => void;
  setIsJoiningCompany: (value: boolean) => void;
}

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const xPct = (mouseX / width - 0.5) * 1.25;
    const yPct = (mouseY / height - 0.5) * 1.25;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div style={{ transform: "translateZ(25px)" }}>{children}</div>
    </motion.div>
  );
};

export default function EmployerCompanyCheck({
  setIsCreatingCompany,
  setIsJoiningCompany,
}: EmployerCompanyCheckProps) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="w-full flex justify-center">
          <TiltCard>
            <Card
              onClick={() => setIsCreatingCompany(true)}
              className="w-full max-w-sm h-80 border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-300 cursor-pointer shadow-md"
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                <PlusCircle className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Create New Company
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set up a new company profile for your organization
                </p>
                <Button variant={"default"}>
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </TiltCard>
        </div>

        <div className="w-full flex justify-center">
          <TiltCard>
            <Card
              onClick={() => setIsJoiningCompany(true)}
              className="w-full max-w-sm h-80 border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-300 cursor-pointer shadow-md"
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Users className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Join Existing Company
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with your team's existing company profile
                </p>
                <Button variant={"default"}>
                  Join Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
