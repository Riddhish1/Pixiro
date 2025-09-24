import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HomeIcon from "@/icons/HomeIcon";
import LeadIcon from "@/icons/LeadIcon";
import React from "react";
// import { webinarData } from "./__test__/webinardata";
import WebinarCard from "./_components/WebinarCard";
import PageHeader from "@/components/ReusableComponent/PageHeader";
import { onAuthenticateUser } from "@/action/auth";
import { getWebinarByPresenterId } from "@/action/webinar";
import { redirect } from "next/navigation";
import { Webinar, WebinarStatusEnum } from "@prisma/client";
import { Webcam } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    webinarStatus: string;
  }>;
};

const page = async ({ searchParams }: Props) => {
  const { webinarStatus } = await searchParams;
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) {
    redirect("/");
  }
  const webinars = await getWebinarByPresenterId(
    checkUser?.user?.id,
    webinarStatus as WebinarStatusEnum
  );
  return (
    <Tabs defaultValue="all" className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<HomeIcon className="w-3 h-3" />}
        mainIcon={<Webcam className="w-12 h-12" />}
        rightIcon={<LeadIcon className="w-4 h-4" />}
        heading="The home to all your webinars"
        placeholder="Search option..."
      >
        <TabsList className="bg-transparent space-x-3">
          <TabsTrigger
            value="all"
            className="bg-secondary opacity-50 data-[state=active]:opacity-100 px-8 py-4"
          >
            <Link href={`/webinars?webinarStatus=all`}>All</Link>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="bg-secondary  px-8 py-4">
            <Link href={`/webinars?webinarStatus=upcoming`}>Upcoming</Link>
          </TabsTrigger>
          <TabsTrigger value="ended" className="bg-secondary px-8 py-4">
            <Link href={`/webinars?webinarStatus=ended`}>Ended</Link>
          </TabsTrigger>
        </TabsList>
      </PageHeader>
      <TabsContent
        value="all"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4  place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebinarCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found
          </div>
        )}
      </TabsContent>
      <TabsContent value="upcoming">
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebinarCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found
          </div>
        )}
      </TabsContent>
      <TabsContent value="ended">
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebinarCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default page;
