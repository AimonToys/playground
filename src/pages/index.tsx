import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import Head from "next/head";
import { useCallback } from "react";

import Playground from "@/components/playground/Playground";
import { ConfigProvider, useConfig } from "@/hooks/useConfig";
import { ConnectionMode, ConnectionProvider, useConnection } from "@/hooks/useConnection";

export default function Home() {
  return (
    <ConfigProvider>
      <ConnectionProvider>
        <HomeInner />
      </ConnectionProvider>
    </ConfigProvider>
  );
}

export function HomeInner() {
  const { shouldConnect, wsUrl, token, mode, connect, disconnect } =
    useConnection();
  
  const { config } = useConfig();

  const handleConnect = useCallback(
    async (c: boolean, mode: ConnectionMode) => {
      c ? connect(mode) : disconnect();
    },
    [connect, disconnect]
  );

  return (
    <>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-black">
        <LiveKitRoom
          serverUrl={wsUrl}
          token={token}
          connect={shouldConnect}
          onError={(e) => console.error(e)}
        >
        <Playground
            onConnect={(c) => {
              const m = process.env.NEXT_PUBLIC_LIVEKIT_URL ? "env" : mode;
              handleConnect(c, m);
            }}
          />
          <RoomAudioRenderer />
          <StartAudio label="Click to enable audio playback" />
        </LiveKitRoom>
      </main>
    </>
  );
}