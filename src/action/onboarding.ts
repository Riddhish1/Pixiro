import { prismaClient } from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server";
import { WebinarStatusEnum } from "../../prisma/generated/client";

export const getOnboardingStatus = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403 };
    }

    // Get the current user's database record
    const currentUserRecord = await prismaClient.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        webinars: true,
        aiAgents: true,
      },
    });
    console.log("🔴 currentUserRecord", currentUserRecord?.webinars);

    if (!currentUserRecord) {
      return { status: 404, error: "User not found" };
    }

    // Check if user has connected their Stripe account
    const hasStripeConnected = !!currentUserRecord.stripeConnectId;

    // Filter AI agents to only include those created by the current user
    const hasAiAgents =
      currentUserRecord.aiAgents && currentUserRecord.aiAgents.length > 0;

    // Check if user has created any webinars
    // Only count webinars that are actually created by the user and not in draft
    const hasCreatedWebinar = currentUserRecord.webinars.some(
      (webinar) =>
        webinar.presenterId === currentUserRecord.id &&
        webinar.webinarStatus !== WebinarStatusEnum.CANCELLED
    );

    // Check if user has any leads (attendees who registered for their webinars)
    const hasLeads = await prismaClient.attendance.findFirst({
      where: {
        webinar: {
          presenterId: currentUserRecord.id,
        },
        attendedType: "REGISTERED",
      },
    });

    // Check if user has any converted leads
    const hasConvertedLeads = await prismaClient.attendance.findFirst({
      where: {
        webinar: {
          presenterId: currentUserRecord.id,
        },
        attendedType: "CONVERTED",
      },
    });

    return {
      status: 200,
      steps: {
        createWebinar: hasCreatedWebinar,
        connectStripe: hasStripeConnected,
        createAiAgent: hasAiAgents,
        getLeads: !!hasLeads,
        conversionStatus: !!hasConvertedLeads,
      },
    };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500, error: "Internal Server Error" };
  }
};
