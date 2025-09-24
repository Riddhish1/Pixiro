import React from "react";
import AiAgentSidebar from "./_components/AiAgentSidebar";
import ModelSection from "./_components/ModalSection";
import { onAuthenticateUser } from "@/action/auth";
import { redirect } from "next/navigation";
import { UserWithAiAgent } from "@/lib/type";

const page = async () => {
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) {
    redirect("/sign-in");
  }
  const user = checkUser.user as UserWithAiAgent;
  console.log("User data:", checkUser.user);
  return (
    <div className="w-full flex h-[80vh] text-primary border border-border rounded-se-xl">
      {/* Left Sidebar */}
      <AiAgentSidebar
        aiAgents={user?.aiAgents || []}
        userId={user?.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ModelSection />
      </div>
    </div>
  );
};

export default page;
