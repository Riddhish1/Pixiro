"use server";

import { prismaClient } from "@/lib/prismaClient";
import EmailTemplate from "@/lib/webinarStartEmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBulkEmail = async (webinarId: string) => {
  try {
    const attendances = await prismaClient.attendance.findMany({
      where: {
        webinarId: webinarId,
      },
      include:{
        user: true,
      }
    });

    const res = await resend.batch.send(
      attendances.map((attendance) => ({
        from: "Spotlight <kuldeep@kuldeepsaini.dev>",
        to: [attendance.user.email],
        subject: "Webinar Has Started",
        react: EmailTemplate({ webinarId }),
      }))
    );
    console.log("Email sent successfully", res);
  } catch (error) {
    console.log("Error sending email", error);
   throw new Error("Error sending email");
  }
};
