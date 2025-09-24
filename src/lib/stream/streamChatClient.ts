import { StreamChat } from "stream-chat";

  export const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);