import { Button } from "@/components/ui/button"
import { ParticipantView, useCallStateHooks } from "@stream-io/video-react-sdk"

type Props = {
  showChat: boolean
  setShowChat: (show: boolean) => void
}


const CustomParticipantView = ({ showChat, setShowChat }: Props) => {
  const { useParticipants } = useCallStateHooks()
  const participants = useParticipants()
  const hostParticipant = participants.length > 0 ? participants[0] : null

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Webinar</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
            LIVE
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 p-4 gap-4">
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-700 bg-black">
          {hostParticipant ? (
            <ParticipantView participant={hostParticipant} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Waiting for the host to start streaming...</p>
              </div>
            </div>
          )}
        </div>

        {showChat && (
          <div className="w-80  border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-700 text-white font-medium">Chat</div>
            {/* <ChatView
              channelId={process.env.STREAM_CALL_ID!}
              userToken={userToken}
            /> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomParticipantView