import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ReactNode, useEffect, useRef, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import { Box, Button, Divider, Heading, HStack, Icon, Skeleton, Spacer, Tooltip, VStack } from "@chakra-ui/react";
import { MdCamera, MdFileDownload, MdYoutubeSearchedFor } from "react-icons/md";
import { client } from "utils/api/client";

const DefaultSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

// This is a rather complex context instance, using it inside states would
// incur heavy performance penalties
declare global {
  interface Window {
    molstar?: PluginContext | null;
  }
}

interface MolstarWrapperProps {
  /* Particle classification ID */
  classificationId: number;
  autoProcId: number;
  /* Additional custom controls */
  children?: ReactNode;
}

function MolstarWrapper({ classificationId, autoProcId, children }: MolstarWrapperProps) {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataTimestamp, setDatatimestamp] = useState("1");
  const [rawData, setRawData] = useState<ArrayBuffer | null | undefined>();

  useEffect(() => {
    client.safe_get(`autoProc/${autoProcId}/classification/${classificationId}/image`).then(async (response) => {
      if (response.status === 200) {
        setRawData(response.data);
        setDatatimestamp(new Date().getTime().toString());
      } else {
        setRawData(null);
      }
    });
  }, [autoProcId, classificationId]);

  useEffect(() => {
    async function init() {
      window.molstar = new PluginContext(DefaultSpec);

      await window.molstar.init();

      if (!window.molstar.initViewer(canvasRef.current as HTMLCanvasElement, viewerDiv.current as HTMLDivElement)) {
        return;
      }

      const data = await window.molstar.builders.data.rawData({ data: rawData! }, { state: { isGhost: true } });
      const parsed = await window.molstar.dataFormats.get("ccp4")!.parse(window.molstar, data);
      const volume: StateObjectSelector<PluginStateObject.Volume.Data> = parsed.volumes?.[0] ?? parsed.volume;

      const repr = window.molstar
        .build()
        .to(volume)
        .apply(
          StateTransforms.Representation.VolumeRepresentation3D,
          createVolumeRepresentationParams(window.molstar, volume.data!)
        );

      await repr.commit();
    }

    if (rawData && canvasRef) {
      init();
    }

    return () => {
      // See https://github.com/molstar/molstar/issues/730
      window.molstar?.animationLoop.stop();
      window.molstar?.dispose();
      window.molstar = null;
    };
  }, [rawData, viewerDiv, canvasRef]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
        <Tooltip label='Reset Zoom'>
          <Button isDisabled={!rawData} onClick={() => window.molstar?.managers.camera.reset()}>
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' />
        <Tooltip label='Take Screenshot'>
          <Button isDisabled={!rawData} onClick={() => window.molstar?.helpers.viewportScreenshot?.download()}>
            <Icon as={MdCamera} />
          </Button>
        </Tooltip>
        <Tooltip label='Download MRC File'>
          <Button isDisabled>
            <Icon as={MdFileDownload} />
          </Button>
        </Tooltip>
        <Spacer />
        {children}
      </HStack>
      <Box flexGrow={5} h='90%' w='100%' ref={viewerDiv}>
        {rawData ? (
          <canvas key={dataTimestamp} data-testid='render-canvas' ref={canvasRef} />
        ) : rawData === null ? (
          <VStack w='100%' h='100%' bg='diamond.75'>
            <Heading m='auto' variant='notFound'>
              No Valid Volume File
            </Heading>
          </VStack>
        ) : (
          <Skeleton h='100%' w='100%' />
        )}
      </Box>
    </VStack>
  );
}

export default MolstarWrapper;
