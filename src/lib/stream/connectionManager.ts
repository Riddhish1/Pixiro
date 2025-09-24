import { StreamVideoClient } from '@stream-io/video-react-sdk';

let activeClient: StreamVideoClient | null = null;

export const getStreamClient = (apiKey: string, token: string, userId: string) => {
  if (!activeClient) {
    activeClient = new StreamVideoClient(apiKey);
    
    // Set up initial connection
    activeClient.connectUser(
      {
        id: userId,
      },
      token
    );
  }
  return activeClient;
};

export const disconnectStreamClient = async () => {
  if (activeClient) {
    try {
      await activeClient.disconnectUser();
    } catch (error) {
      console.error('Error disconnecting Stream client:', error);
    } finally {
      activeClient = null;
    }
  }
};