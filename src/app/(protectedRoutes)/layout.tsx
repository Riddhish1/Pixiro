import { onAuthenticateUser } from "@/action/auth";
import { getAllProductsFromStripe } from "@/action/stripe";
import Header from "@/components/ReusableComponent/LayoutComponents/Header";
import Sidebar from "@/components/ReusableComponent/LayoutComponents/Sidebar";
import { UserWithAiAgent } from "@/lib/type";
import { redirect } from "next/navigation";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

export const dynamic = 'force-dynamic';

const Layout = async ({ children }: Props) => {
  const userExist = await onAuthenticateUser();
  if (!userExist.user) {
    redirect("/sign-in");
  }
  const user = userExist.user as UserWithAiAgent;
  const stripeProducts = await getAllProductsFromStripe();


  return (
    <div className="flex w-full min-h-screen">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area with scrollable content */}
      <div className="flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto">
        {/* Fixed header */}
        <Header
          assistants={user?.aiAgents || []}
          user={user}
          stripeProducts={stripeProducts.products || []}
        />
        {/* Scrollable content area with increased bottom padding */}
        <div className="flex-1 py-10 ">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
