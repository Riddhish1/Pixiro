"use server";

import { prismaClient } from "@/lib/prismaClient";
import { getStreamClient } from "@/lib/stream/streamVideoClient";
import { Attendee, Webinar } from "../../prisma/generated/client";
import { UserRequest } from "@stream-io/node-sdk";

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || "guest",
      role: "user",
      name: attendee?.name || "Guest",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${attendee?.name || "Guest"}`,
    };
    await getStreamClient.upsertUsers([newUser]);
    // validity is optional (by default the token is valid for an hour)
    // Set token validity to 55 minutes to allow for refresh before expiration
    const validity = 55 * 60; // 3300 seconds = 55 minutes
    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || "guest",
      validity_in_seconds: validity,
    });

    return {
      token,
      expiresIn: validity
    };
  } catch (error) {
    console.error("Error generating Stream Io token:", error);
    throw new Error("Failed to generate Stream Io token");
  }
};

export const createAndStartStream = async (webinar: Webinar) => {
  try {
    const checkWebinar = await prismaClient.webinar.findMany({
      where:{
        presenterId: webinar.presenterId,
        webinarStatus:"LIVE"
      }
    })

    if(checkWebinar.length > 0) {
      throw new Error("You already have a live stream running")
    }
    const call = getStreamClient.video.call("livestream", webinar.id);
    await call.getOrCreate({
      data: {
        // starts_at: new Date(webinar.startTime),
        created_by_id: webinar.presenterId,
        members: [
          {
            user_id: webinar.presenterId,
            role: "host",
          },
        ],
      },
    });
    call.goLive({
      start_recording: true,
      recording_storage_name:"livestream",
    });
    console.log("Stream started successfully:", call);
  } catch (error) {
    console.error("Error creating and starting stream:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create and start stream");
  }
};

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: "user",
      name: username || "Guest",
      image:
        profilePic ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    };
    await getStreamClient.upsertUsers([newUser]);

    // Set token validity to 55 minutes to allow for refresh before expiration
    const validity = 55 * 60; // 3300 seconds = 55 minutes
    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });

    return {
      token,
      expiresIn: validity
    };
  } catch (error) {
    console.error("Error generating Stream Io token:", error);
    throw new Error("Failed to generate Stream Io token");
  }
};


//get call recording
export const getStreamRecording = async(webinarId:string) =>{
  try{
    const call = getStreamClient.video.call("livestream", webinarId);

    const calls = await call.listRecordings()

    return {
      success: true,
      status: 200,
      data: calls.recordings[calls.recordings.length-1],
    }
  }catch(error){
    console.error("Error generating Stream Io token:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to generate Stream Io token",
    }
  }
}
