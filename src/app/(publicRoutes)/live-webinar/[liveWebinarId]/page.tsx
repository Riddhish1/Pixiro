import { getWebinarById } from '@/action/webinar'
import { onAuthenticateUser } from '@/action/auth'
import RenderWebinar from './_components/Common/RenderWebinar'
import { WebinarWithPresenter } from '@/lib/type'
import { getStreamRecording } from '@/action/stremIo'

type Props = {
  params: Promise<{
    liveWebinarId: string
  }>
  searchParams: Promise<{
    error: string
  }>
}

const page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params
  const { error } = await searchParams
  const webinarData = await getWebinarById(liveWebinarId)
  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar not found
      </div>
    )
  }

  const checkUser = await onAuthenticateUser()
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string
  let recording = null
  if (webinarData.webinarStatus === 'ENDED') {
    recording = await getStreamRecording(webinarData.id)
    console.log(recording)
  }

  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        error={error}
        user={checkUser.user || null}
        webinar={webinarData as WebinarWithPresenter}
        apiKey={apiKey}
        recording={recording?.data || null}
      />
    </div>
  )
}

export default page
