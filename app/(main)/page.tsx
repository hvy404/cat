"use client";
import { useAuth, useSignUp, SignInButton } from "@clerk/nextjs";
import SignUp from "../candidate/sign-up-main";

const Main = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <SignUp />
      </div>
    </div>
  );
};

export default Main;
