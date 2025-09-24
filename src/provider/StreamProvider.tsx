"use client";
import React, { useEffect } from 'react';
import { StreamTheme } from "@stream-io/video-react-sdk";
import { disconnectStreamClient } from '../lib/stream/connectionManager';
import "@stream-io/video-react-sdk/dist/css/styles.css";

type Props = {
  children: React.ReactNode;
}

const StreamProvider = ({children}: Props) => {
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnectStreamClient().catch(console.error);
    };
  }, []);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnectStreamClient().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <StreamTheme>{children}</StreamTheme>
  );
};

export default StreamProvider;