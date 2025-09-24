"use client";
import { type User, WebinarStatusEnum } from "../../../../../../../prisma/generated/client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import WebinarUpcomingState from "../UpcomingWebinar/WebinarUpcomingState";
import LiveStreamState from "../LiveWebinar/LiveStreamState";
import Participant from "../Participant/Participant";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { StreamCallRecording, WebinarWithPresenter } from "@/lib/type";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type RenderWebinarProps = {
  error: string | undefined;
  user: User | null;
  webinar: WebinarWithPresenter;
  apiKey: string;
  recording: StreamCallRecording | null;
};

const RenderWebinar = ({
  error,
  user,
  webinar,
  apiKey,
  recording,
}: RenderWebinarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { attendee } = useAttendeeStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  console.log(
    webinar.startTime,
    new Date(webinar.startTime).getTime() < Date.now()
  );

  return (
    <React.Fragment>
      {webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
        <React.Fragment>
          {user?.id === webinar.presenterId ? (
            <LiveStreamState
              apiKey={apiKey}
              webinar={webinar}
              callId={webinar.id}
              user={user}
            />
          ) : attendee ? (
            <Participant
              apiKey={apiKey}
              webinar={webinar}
              callId={webinar.id}
            />
          ) : (
            <WebinarUpcomingState
              webinar={webinar}
              currentUser={user || null}
            />
          )}
        </React.Fragment>
      ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-primary">
              {webinar?.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              This webinar has been cancelled.
            </p>
          </div>
        </div>
      ) : webinar.webinarStatus === WebinarStatusEnum.ENDED ? (
        <AspectRatio
          ratio={16 / 9}
          className="w-full h-full rounded-lg overflow-hidden mt-10 border border-input"
        >
          {recording?.url ? (
            <video
              className="w-full h-full rounded-lg"
              controls
              src={recording?.url}
            />
          ) : (
            <div className="flex justify-center items-center h-full w-full">
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-semibold text-primary">
                  {webinar?.title}
                </h3>
                <p className="text-muted-foreground text-xl">
                  This webinar has ended. No recording is available.
                </p>
              </div>
            </div>
          )}
        </AspectRatio>
      ) : (
        <WebinarUpcomingState webinar={webinar} currentUser={user || null} />
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;
