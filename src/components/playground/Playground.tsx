import { useConnectionState, useLocalParticipant, useTracks, useVoiceAssistant } from "@livekit/components-react";
import { ConnectionState, LocalParticipant, Track } from "livekit-client";
import { useEffect, useMemo } from "react";
import { VideoTrack, BarVisualizer } from "@livekit/components-react";
import { useConfig } from "@/hooks/useConfig";
import { LoadingSVG } from "@/components/button/LoadingSVG";

export interface PlaygroundProps {
  onConnect: (connect: boolean) => void;
}

export default function Playground({ onConnect }: PlaygroundProps) {
  const { config } = useConfig();
  const { localParticipant } = useLocalParticipant();
  const voiceAssistant = useVoiceAssistant();
  const roomState = useConnectionState();
  const tracks = useTracks();

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, roomState]);

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const videoContent = useMemo(() => {
    if (roomState === ConnectionState.Disconnected) {
      return (
        <div className="flex items-center justify-center text-gray-700 text-center w-full h-full">
          No video track. Connect to get started.
        </div>
      );
    }

    if (!agentVideoTrack) {
      return (
        <div className="flex items-center justify-center text-gray-700 text-center w-full h-full">
          Waiting for video track...
        </div>
      );
    }

    return (
      <VideoTrack
        trackRef={agentVideoTrack}
        className="w-full h-full object-cover"
      />
    );
  }, [agentVideoTrack, roomState]);


  const audioTileContent = useMemo(() => {
    const disconnectedContent = (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center w-full">
        No audio track. Connect to get started.
      </div>
    );

    const waitingContent = (
      <div className="flex flex-col items-center gap-2 text-gray-700 text-center w-full">
        <LoadingSVG />
        Waiting for audio track
      </div>
    );

    const visualizerContent = (
      <div
        className={`flex items-center justify-center w-full h-48 [--lk-va-bar-width:30px] [--lk-va-bar-gap:20px] [--lk-fg:var(--lk-theme-color)]`}
      >
        <BarVisualizer
          state={voiceAssistant.state}
          trackRef={voiceAssistant.audioTrack}
          barCount={5}
          options={{ minHeight: 20 }}
        />
      </div>
    );

    if (roomState === ConnectionState.Disconnected) {
      return disconnectedContent;
    }

    if (!voiceAssistant.audioTrack) {
      return waitingContent;
    }

    return visualizerContent;
  }, [
    voiceAssistant.audioTrack,
    config.settings.theme_color,
    roomState,
    voiceAssistant.state,
  ]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        className={`px-4 py-2 rounded ${
          roomState === ConnectionState.Connected
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white`}
        onClick={() => onConnect(roomState === ConnectionState.Disconnected)}
      >
        {roomState === ConnectionState.Connected ? "Disconnect" : "Connect"}
      </button>
      <div className="w-[360px] h-[360px] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        {audioTileContent}
      </div>
    </div>
  );
}