import { Button } from "@/components/ui/button";
import { User, Webinar, WebinarStatusEnum } from "../../../../../../../prisma/generated/client";
import { format } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import WaitListComponent from "./WaitListComponent";
import CountdownTimer from "./CountdownTimer";
import { toast } from "sonner";
import { changeWebinarStatus } from "@/action/webinar";
import { useRouter } from "next/navigation";
import { sendBulkEmail } from "@/action/resend";
import { createAndStartStream } from "@/action/stremIo";


type Props = {
  webinar: Webinar;
  currentUser: User | null;
};

const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleStartWebinar = async () => {
    setLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      await createAndStartStream(webinar)
      const res = await changeWebinarStatus(webinar.id, "LIVE");
      if (!res.success) {
        throw new Error(res.message);
      }
      await sendBulkEmail(webinar.id);
      router.refresh();
      toast.success("Webinar started successfully");
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen mx-auto max-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      {/* timer container */}
      <div className="space-y-6">
        <p className="text-3xl font-semibold text-primary text-center">
          Seems Like you are a little early
        </p>

        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>

      {/* Reminder component */}
      <div className="space-y-6 w-full h-full flex justify-center items-center flex-col">
        <div className="w-full max-w-md aspect-video relative rounded-4xl overflow-hidden mb-6">
          <Image
            src={"/ilfthumbnail.png"}
            alt={webinar.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        {webinar?.webinarStatus === WebinarStatusEnum.LIVE ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="LIVE" />
        ) : webinar?.webinarStatus === WebinarStatusEnum.CANCELLED ? (
          <p className="text-xl text-foreground text-center font-semibold">
            Webinar is cancelled
          </p>
        ) : webinar?.webinarStatus === WebinarStatusEnum.ENDED ? (
          <Button disabled={true}>Ended</Button>
        ) : webinar?.webinarStatus === WebinarStatusEnum.SCHEDULED &&
          new Date(webinar.startTime).getTime() > Date.now() ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="SCHEDULED" />
        ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ||
          new Date(webinar.startTime).getTime() < Date.now() ? (
          currentUser?.id === webinar?.presenterId ? (
            <Button
              className="w-full max-w-[300px] font-semibold"
              onClick={handleStartWebinar}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Webinar"
              )}
            </Button>
          ) : (
            <WaitListComponent
              webinarId={webinar.id}
              webinarStatus="WAITING_ROOM"
            />
          )
        ) : null}
      </div>

      {/* description component */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-primary">
          {webinar?.title}
        </h3>
        <p className="text-muted-foreground text-xs">{webinar.description}</p>
        <div className="w-full justify-center flex gap-2 flex-wrap items-center">
          <Button
            variant={"outline"}
            className="rounded-md bg-secondary backdrop-blur-2xl"
          >
            <Calendar className="mr-2" />
            {format(new Date(webinar.startTime), "dd MMMM yyyy")}
          </Button>

          <Button variant={"outline"}>
            <Clock className="mr-2" />
            {format(new Date(webinar.startTime), "hh:mm a")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebinarUpcomingState;
