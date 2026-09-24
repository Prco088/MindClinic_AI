import { RoomServiceClient } from "livekit-server-sdk";

export const getLiveKitServer = () => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit environment variables are not configured.");
  }

  return new RoomServiceClient(wsUrl, apiKey, apiSecret);
};
