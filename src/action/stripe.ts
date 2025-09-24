"use server";

import { stripe } from "@/lib/stripe";
import { onAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "../../prisma/generated/client";
import { changeAttendanceType } from "./attendance";

// ✅ Fetch all Stripe products for connected account
export const getAllProductsFromStripe = async () => {
  try {
    const currentUser = await onAuthenticateUser();

    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    if (!currentUser.user.stripeConnectId) {
      return {
        error: "User not connected to Stripe",
        status: 401,
        success: false,
      };
    }

    const products = await stripe.products.list(
      {},
      {
        stripeAccount: currentUser.user.stripeConnectId,
      }
    );

    return {
      products: products.data,
      status: 200,
      success: true,
    };
  } catch (error) {
    console.log("Error getting products from Stripe", error);
    return {
      error: "Error getting products from Stripe",
      status: 500,
      success: false,
    };
  }
};

// ✅ Create one-time payment checkout link
export const createCheckoutLink = async (
  priceId: string,
  stripeId: string,
  attendeeId: string,
  webinarId: string,
  bookCall: boolean = false
) => {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?attendeeId=${attendeeId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancelled`,
        metadata: {
          attendeeId: attendeeId,
          webinarId: webinarId,
        },
      },
      {
        stripeAccount: stripeId,
      }
    );

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    if (bookCall) {
      await changeAttendanceType(attendeeId, webinarId, "ADDED_TO_CART");
    }

    return {
      sessionUrl: session.url,
      status: 200,
      success: true,
    };
  } catch (error) {
    console.log("Error creating checkout link", error);
    return {
      error: error instanceof Error ? error.message : "Error creating checkout link",
      status: 500,
      success: false,
      sessionUrl: null
    };
  }
};

// ✅ Update attendee after successful payment
export const updateAttendee = async (attendeeId: string) => {
  try {
    await prismaClient.attendance.update({
      where: { id: attendeeId },
      data: {
        attendedType: AttendedTypeEnum.CONVERTED,
      },
    });
  } catch (error) {
    console.error("Error updating attendee:", error);
  }
};
