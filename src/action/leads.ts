'use server'

import { prismaClient } from '@/lib/prismaClient'
import { currentUser } from '@clerk/nextjs/server'

export const getLeads = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 403 }
    }

    // First get the current user's database record
    const currentUserRecord = await prismaClient.user.findUnique({
      where: {
        clerkId: user.id,
      },
    })

    if (!currentUserRecord) {
      return { status: 404, error: 'User not found' }
    }

    // Get all attendees who have attended webinars created by this user
    const leads = await prismaClient.attendee.findMany({
      where: {
        Attendance: {
          some: {
            webinar: {
              presenterId: currentUserRecord.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        callStatus: true,
        createdAt: true,
        updatedAt: true,
        Attendance: {
          where: {
            webinar: {
              presenterId: currentUserRecord.id,
            },
          },
          select: {
            attendedType: true,
            webinar: {
              select: {
                tags: true,
              },
            },
          },
        },
      },
    })

    // Transform the data to match the expected format
    const transformedLeads = leads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: '', // Phone is not in our schema, we can add it later if needed
      tags: lead.Attendance.flatMap((attendance) => attendance.webinar.tags),
    }))

    return {
      status: 200,
      leads: transformedLeads,
    }
  } catch (error) {
    console.log('🔴 ERROR', error)
    return { status: 500, error: 'Internal Server Error' }
  }
}
