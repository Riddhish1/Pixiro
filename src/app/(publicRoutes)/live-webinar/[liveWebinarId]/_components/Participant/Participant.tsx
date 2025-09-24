"use client";

import { useState, useEffect, useRef } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  type User,
  type Call,
} from "@stream-io/video-react-sdk";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { Button } from "@/components/ui/button";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getStreamIoToken } from "@/action/stremIo";
import LiveWebinarView from "../Common/LiveWebinarView";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { WebinarWithPresenter } from "@/lib/type";

type ParticipantProps = {
  apiKey: string;
  webinar: WebinarWithPresenter;
  callId: string;
};

const Participant = ({ apiKey, webinar, callId }: ParticipantProps) => {
  const { attendee } = useAttendeeStore();
  const [showChat, setShowChat] = useState<boolean>(true);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "failed" | "reconnecting" | "connected"
  >("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clientInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Prevent re-initialization
    if (clientInitialized.current) return;

    const initClient = async () => {
      try {
        setConnectionStatus("connecting");
        // First create a user object
        const user: User = {
          id: attendee?.id || "guest",
          name: attendee?.name || "Guest",
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${
            attendee?.name || "Guest"
          }`,
        };

        const tokenResponse = await getStreamIoToken(attendee);
        
        // Set up auto refresh
        const refreshToken = async () => {
          try {
            const newTokenResponse = await getStreamIoToken(attendee);
            setToken(newTokenResponse.token);
            
            // Reconnect client with new token
            if (client) {
              await client.disconnectUser();
              await client.connectUser(user, newTokenResponse.token);
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
            setConnectionStatus("failed");
            setErrorMessage("Failed to refresh connection token");
          }
        };

        // Schedule token refresh 5 minutes before expiration
        const scheduleRefresh = () => {
          const refreshTime = (tokenResponse.expiresIn - 300) * 1000; // 5 minutes before expiration
          setTimeout(() => {
            refreshToken();
            scheduleRefresh(); // Schedule next refresh
          }, refreshTime);
        };
        
        setToken(tokenResponse.token);
        const streamClient = new StreamVideoClient(apiKey);
        await streamClient.connectUser(user, tokenResponse.token);
        
        // Start the refresh cycle
        scheduleRefresh();

        // Set up connection status listeners
        streamClient.on("connection.changed", (event) => {
          if (event.online) {
            setConnectionStatus("connected");
          } else {
            setConnectionStatus("reconnecting");
          }
        });

        await streamClient.connectUser(user, tokenResponse.token);
        const streamCall = streamClient.call("livestream", callId);
        await streamCall.join({ create: true });

        setClient(streamClient);
        setCall(streamCall);
        setConnectionStatus("connected");
        clientInitialized.current = true;
      } catch (error) {
        console.error("Error initializing client or joining call:", error);
        setConnectionStatus("failed");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to connect to webinar"
        );
      }
    };

    initClient();

    // Cleanup on unmount
    return () => {
      const currentCall = call;
      const currentClient = client;

      if (currentCall && currentClient) {
        currentCall
          .leave()
          .then(() => {
            console.log("Left the call");
            currentClient.disconnectUser();
            clientInitialized.current = false;
          })
          .catch((error) => {
            console.error("Error leaving call:", error);
          });
      }
    };
  }, [apiKey, attendee, call, callId, client, webinar.id]);

  // If no attendee is set, show a message
  if (!attendee) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
          <h2 className="text-2xl font-bold mb-4">
            Please register to join the webinar
          </h2>
          <p className="text-muted-foreground mb-6">
            Registration is required to participate in this webinar.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground"
          >
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced connecting UI
  if (!client || !call || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
          {connectionStatus === "connecting" && (
            <>
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-accent-primary animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-accent-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Joining Webinar</h2>
              <p className="text-muted-foreground">
                Connecting to {webinar.title}...
              </p>
              <div className="mt-6 flex justify-center space-x-1">
                <span className="h-2 w-2 bg-accent-primary rounded-full animate-bounce"></span>
                <span
                  className="h-2 w-2 bg-accent-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="h-2 w-2 bg-accent-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </>
          )}

          {connectionStatus === "reconnecting" && (
            <>
              <div className="mx-auto w-16 h-16 mb-4 text-amber-500">
                <WifiOff className="h-16 w-16 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Reconnecting</h2>
              <p className="text-muted-foreground mb-4">
                Connection lost. Attempting to reconnect...
              </p>
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div
                  className="bg-amber-500 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </>
          )}

          {connectionStatus === "failed" && (
            <>
              <div className="mx-auto w-16 h-16 mb-4 text-destructive">
                <AlertCircle className="h-16 w-16" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "Unable to connect to the webinar."}
              </p>
              <div className="flex space-x-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Button
                  className="bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <LiveWebinarView
          showChat={showChat}
          setShowChat={setShowChat}
          webinar={webinar}
          isHost={false}
          username={attendee?.name}
          userId={attendee?.id}
          userToken={token}
          call={call}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default Participant;
