"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { TelemedicineJoinScreen } from "./telemedicine-join-screen";

interface TelemedicineRoomProps {
  token: string;
  serverUrl: string;
  isProfessional: boolean;
  onEnd?: () => void;
}

export function TelemedicineRoom({ token, serverUrl, isProfessional, onEnd }: TelemedicineRoomProps) {
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <TelemedicineJoinScreen 
        onJoin={() => setJoined(true)} 
        isProfessional={isProfessional} 
      />
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "100vh" }}
      onDisconnected={() => {
        setJoined(false);
        if (onEnd) onEnd();
      }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
