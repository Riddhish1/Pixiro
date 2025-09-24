"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, Video, Users } from "lucide-react"

type Props = {
  isHost: boolean
  webinarTitle?: string
  presenterName?: string
  thumbnailUrl?: string
  onStartStream?: () => void
  estimatedStartTime?: string
  viewerCount?: number
}

const WaitingRoom = ({
  isHost,
  webinarTitle = "Upcoming Webinar",
  presenterName = "Host Name",
  thumbnailUrl = "/placeholder.svg?height=400&width=600",
  onStartStream,
  estimatedStartTime = "a few moments",
  viewerCount = 0,
}: Props) => {
  const [isCreatingStream, setIsCreatingStream] = useState(false)
  const [isStreamReady, setIsStreamReady] = useState(false)

  const handleCreateStream = async () => {
    setIsCreatingStream(true)

    // Simulate API call to create stream
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsStreamReady(true)
      setIsCreatingStream(false)
    } catch (error) {
      console.error("Error creating stream:", error)
      setIsCreatingStream(false)
    }
  }

  const handleStartStream = () => {
    onStartStream?.()
  }

  if (isHost) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{webinarTitle}</h2>

        <div className="w-full aspect-video bg-black rounded-lg mb-6 relative overflow-hidden">
          {/* Preview of host's camera would go here in a real implementation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isStreamReady ? (
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-300">Your stream is ready to start</p>
              </div>
            ) : (
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Camera preview will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-gray-300">{viewerCount} viewers waiting</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {!isStreamReady ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateStream}
              disabled={isCreatingStream}
            >
              {isCreatingStream ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Stream...
                </>
              ) : (
                "Create Stream"
              )}
            </Button>
          ) : (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleStartStream}>
              Go Live Now
            </Button>
          )}

          <Button variant="outline" className="w-full">
            Test Audio & Video
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-400 text-center">
          <p>Once you go live, all waiting attendees will automatically join your stream.</p>
        </div>
      </div>
    )
  }

  // Attendee view
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-xl max-w-2xl mx-auto">
      <div className="w-full aspect-video bg-black rounded-lg mb-6 relative overflow-hidden">
        <Image src={thumbnailUrl || "/placeholder.svg"} alt={webinarTitle} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center p-6 backdrop-blur-sm bg-black bg-opacity-30 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">{webinarTitle}</h2>
            <p className="text-gray-300 mb-4">with {presenterName}</p>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-full">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Starting soon</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-300 mb-6">The stream will begin in {estimatedStartTime}. Please wait.</p>

      <div className="flex items-center gap-2 text-gray-400">
        <Users className="h-5 w-5" />
        <span>{viewerCount} people waiting</span>
      </div>
    </div>
  )
}

export default WaitingRoom
