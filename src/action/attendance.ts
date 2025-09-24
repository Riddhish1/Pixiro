"use server";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { AttendedTypeEnum, CallStatusEnum, CtaTypeEnum } from "../../prisma/generated/client";
import { AttendanceData } from "@/lib/type";

export const getWebinarAttendance = async (
  webinarId: string,
  options: {
    includeUsers?: boolean;
    userLimit?: number;
  } = { includeUsers: true, userLimit: 100 }
) => {
  try {
    // Get webinar and counts in a single optimized query using Prisma's aggregation
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      select: {
        id: true,
        ctaType: true,
        tags: true,
        presenter: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!webinar) {
      return {
        success: false,
        status: 404,
        error: "Webinar not found",
      };
    }

    // Get attendance counts by type in a single aggregation query
    const attendanceCounts = await prismaClient.attendance.groupBy({
      by: ["attendedType"],
      where: {
        webinarId,
      },
      _count: {
        attendedType: true,
      },
    });

    // Initialize the result structure
    const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
      AttendedTypeEnum,
      AttendanceData
    >;

    // Process the counts first - this part is very efficient
    for (const type of Object.values(AttendedTypeEnum)) {
      // Skip ADDED_TO_CART for BOOK_A_CALL webinars
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      // Skip BREAKOUT_ROOM for non-BOOK_A_CALL webinars
      if (
        type === AttendedTypeEnum.BREAKOUT_ROOM &&
        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      // Find the count for this type
      const countItem = attendanceCounts.find((item) => {
        // For BOOK_A_CALL, map ADDED_TO_CART to BREAKOUT_ROOM
        if (
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM &&
          item.attendedType === AttendedTypeEnum.ADDED_TO_CART
        ) {
          return true;
        }
        return item.attendedType === type;
      });

      // Initialize with count but empty users array
      result[type] = {
        count: countItem ? countItem._count.attendedType : 0,
        users: [],
      };
    }

    // Fetch user data only if requested
    if (options.includeUsers) {
      // For each attendance type, fetch limited users in separate queries
      for (const type of Object.values(AttendedTypeEnum)) {
        // Skip types that don't apply to this webinar's CTA type
        if (
          (type === AttendedTypeEnum.ADDED_TO_CART &&
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
          (type === AttendedTypeEnum.BREAKOUT_ROOM &&
            webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL)
        ) {
          continue;
        }

        // Get the attendance type to query (map BREAKOUT_ROOM to ADDED_TO_CART for database query)
        const queryType =
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM
            ? AttendedTypeEnum.ADDED_TO_CART
            : type;

        // Only fetch users if there are any attendances of this type
        if (result[type].count > 0) {
          const attendances = await prismaClient.attendance.findMany({
            where: {
              webinarId,
              attendedType: queryType,
            },
            include: {
              user: true,
            },
            take: options.userLimit, // Limit the number of users returned
            orderBy: {
              joinedAt: "desc", // Most recent first
            },
          });

          // Map the attendance data to the user format we want
          result[type].users = attendances.map((attendance) => ({
            id: attendance.user.id,
            name: attendance.user.name,
            email: attendance.user.email,
            attendedAt: attendance.joinedAt,
            stripeConnectId: null, 
            callStatus: attendance.user.callStatus, 
            createdAt: attendance.user.createdAt,
            updatedAt: attendance.user.updatedAt,
          }));
        }
      }
    }

    return {
      success: true,
      data: result,
      ctaType: webinar.ctaType,
      webinarTags: webinar.tags || [],
      presenter: webinar.presenter,
    };
  } catch (error) {
    console.error("Failed to fetch attendance data:", error);
    return {
      success: false,
      error: "Failed to fetch attendance data",
    };
  }
};

export const registerAttendee = async ({ webinarId, email, name }:{
  webinarId: string
  email: string
  name: string
}) => {
  try {
    if (!webinarId || !email) {
      return { success: false, status: 400, message: "Missing required parameters" }
    }

    const webinar = await prismaClient.webinar.findUnique({ where: { id: webinarId } })
    if (!webinar) {
      return { success: false, status: 404, message: "Webinar not found" }
    }

    // Find or create the attendee by email
    let attendee = await prismaClient.attendee.findUnique({
      where: { email },
    })

    if (!attendee) {
      attendee = await prismaClient.attendee.create({
        data: { email, name },
      })
    }

    // Check for existing attendance
    const existingAttendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: attendee.id,
        webinarId: webinarId,
      },
      include:{
        user:true
      }
    })

    if (existingAttendance) {
      return {
        success: true,
        status: 200,
        data: existingAttendance,
        message: "You are already registered for this webinar",
      }
    }

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        attendedType: AttendedTypeEnum.REGISTERED,
        attendeeId: attendee.id,
        webinarId: webinarId,
      },
      include:{
        user:true
      }
    })

    revalidatePath(`/${webinarId}`)

    return {
      success: true,
      status: 200,
      data: attendance,
      message: "Successfully Registered",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      status: 500,
      error: error,
      message: "Something went wrong",
    }
  }
}

export const checkAttendeeRegistration = async (webinarId: string, email: string) => {
  try {
    // Check if user is already registered
    const existingAttendee = await prismaClient.attendee.findFirst({
      where: {
        email: email,
        Webinar: {
          some: {
            id: webinarId,
          },
        },
      },
    })

    return {
      success: true,
      isRegistered: !!existingAttendee,
    }
  } catch (error) {
    console.error("Error checking registration:", error)
    return {
      success: false,
      isRegistered: false,
      error,
    }
  }
}

export const updateAttendanceStatus = async (attendeeId: string, webinarId: string, attendedType: AttendedTypeEnum) => {
  try {
    const attendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId,
        webinarId,
      },
    })

    if (attendance) {
      await prismaClient.attendance.update({
        where: {
          id: attendance.id,
        },
        data: {
          attendedType,
        },
      })
    } else {
      await prismaClient.attendance.create({
        data: {
          attendeeId,
          webinarId,
          attendedType,
        },
      })
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating attendance status:", error)
    return {
      success: false,
      error,
    }
  }
}

//get Attendee by Id
export const getAttendeeById = async (id: string, webinarId:string) => {
  try {
    const attendee = await prismaClient.attendee.findUnique({
      where: {
        id,
      },
    });

    const attendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: id,
        webinarId: webinarId,
      },
    });

    if (!attendee || !attendance) {
      return {
        status: 404,
        success: false,
        message: "Attendee not found",
      };
    }

    return {
      status: 200,
      success: true,
      message: "Get attendee details successful",
      data: attendee,
    };
  } catch (error) {
    console.log("Error", error);
    return {
      status:500,
      success: false,
      message: "Something went wrong!"
    }
  }
};

// change call status
export const changeCallStatus = async (attendeeId: string, callStatus: CallStatusEnum) => {
  try{
    const attendee = await prismaClient.attendee.update({
      where: {
        id: attendeeId,
      },
      data:{
        callStatus: callStatus,

      }
    })

    return {
      success: true,
      status: 200,
      message: "Call status updated successfully",
      data: attendee,
    }

  }catch(error){
    console.error("Error updating call status:", error)
    return {
      success: false,
      status: 500,
      message: "Failed to update call status",
      error,
    }
  }
}


// change Attendance type
export const changeAttendanceType = async (attendeeId: string, webinarId: string, attendedType: AttendedTypeEnum) => {
  try {
    const attendance = await prismaClient.attendance.update({
      where: {
        attendeeId_webinarId: {
          attendeeId,
          webinarId,
        },
      },
      data: {
        attendedType,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Attendance type updated successfully",
      data: attendance,
    };
  } catch (error) {
    console.error("Error updating attendance type:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to update attendance type",
      error,
    };
  }
};
