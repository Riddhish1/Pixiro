"use client";
import React from 'react'


import { StreamTheme } from "@stream-io/video-react-sdk";

// import the SDK provided styles
import "@stream-io/video-react-sdk/dist/css/styles.css";


type Props = {
  children: React.ReactNode

}

const StreamProvider = ({children}: Props) => {
  return (
    <StreamTheme>{children}</StreamTheme>
  )
}

export default StreamProvider