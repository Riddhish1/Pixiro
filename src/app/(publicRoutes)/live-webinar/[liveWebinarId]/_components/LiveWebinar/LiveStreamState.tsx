import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  User as StreamUser,
} from "@stream-io/video-react-sdk";
import { User } from "../../../../../../../prisma/generated/client";
import { WebinarWithPresenter } from "@/lib/type";
import CustomLivestreamPlayer from "./CustomLiveStreamPlayer";
import { getTokenForHost } from "@/action/stremIo";

type Props = {
  apiKey: string;
  callId: string;
  webinar: WebinarWithPresenter;
  user: User;
};

const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);


  useEffect(() => {
    const init = async () => {
      try {
        const tokenResponse = await getTokenForHost(
          webinar.presenterId,
          webinar.presenter.name,
          webinar.presenter.profileImage
        );
        
        // Set up auto refresh
        const refreshToken = async () => {
          try {
            const newTokenResponse = await getTokenForHost(
              webinar.presenterId,
              webinar.presenter.name,
              webinar.presenter.profileImage
            );
            setHostToken(newTokenResponse.token);
            
            // Reconnect client with new token
            if (client) {
              await client.disconnectUser();
              await client.connectUser(
                {
                  id: webinar.presenterId,
                  name: webinar.presenter.name,
                  image: webinar.presenter.profileImage,
                },
                newTokenResponse.token
              );
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        };

        // Schedule token refresh 5 minutes before expiration
        const scheduleRefresh = () => {
          const refreshTime = (tokenResponse.expiresIn - 300) * 1000; // 5 minutes before expiration
          setTimeout(refreshToken, refreshTime);
        };

        const hostUser: StreamUser = {
          id: webinar.presenterId,
          name: webinar.presenter.name,
          image: webinar.presenter.profileImage,
        };

        const streamClient = new StreamVideoClient(apiKey);
        await streamClient.connectUser(hostUser, tokenResponse.token);
        
        setHostToken(tokenResponse.token);
        setClient(streamClient);
        
        // Start the refresh cycle
        scheduleRefresh();
        setClient(streamClient);
      } catch (error) {
        console.error("Error initializing stream client", error);
      }
    };

    init();
  }, [apiKey, webinar]);

  if (!client || !hostToken) return null;

  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={hostToken}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;
