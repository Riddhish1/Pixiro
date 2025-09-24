import { useEffect, useState } from "react";
import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import LiveWebinarView from "../Common/LiveWebinarView";
import { WebinarWithPresenter } from "@/lib/type";

type Props = {
  username: string;
  callId: string;
  callType: string;
  webinar: WebinarWithPresenter;
  token: string;
};

const CustomLivestreamPlayer = ({
  callId,
  webinar,
  callType,
  username,
  token,
}: Props) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call>();
  const [showChat, setShowChat] = useState(true);


  useEffect(() => {
    if (!client) return;
    
    let isActive = true;
    const myCall = client.call(callType, callId);
    
    const initCall = async () => {
      try {
        await myCall.join({ create: true });
        if (isActive) {
          setCall(myCall);
        }
      } catch (error) {
        console.error("Failed to join the call:", error);
      }
    };

    initCall();

    return () => {
      isActive = false;
      if (myCall) {
        myCall.leave().catch(console.error);
        setCall(undefined);
      }
    };
  }, [client, callId, callType]);

  if (!call) return null;
  return (
    <StreamCall call={call}>
      <LiveWebinarView
        showChat={showChat}
        setShowChat={setShowChat}
        webinar={webinar}
        isHost={true}
        username={username}
        userId={webinar.presenterId}
        userToken={token}
        call={call}
      />
    </StreamCall>
  );
};

export default CustomLivestreamPlayer;