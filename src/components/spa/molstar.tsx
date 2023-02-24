import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { createRef, useEffect, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import {
  Box,
  Button,
  createStandaloneToast,
  Divider,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { MdCamera, MdYoutubeSearchedFor } from "react-icons/md";
import { baseToast } from "../../styles/components";
import { client } from "../../utils/api/client";

const DefaultSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

declare global {
  interface Window {
    molstar?: PluginContext | null;
  }
}

interface MolstarWrapperProps {
  /* Particle classification ID */
  classificationId: number;
  autoProcId: number;
}

function MolstarWrapper({ classificationId, autoProcId }: MolstarWrapperProps) {
  const { toast } = createStandaloneToast();
  const viewerDiv = createRef<HTMLDivElement>();
  const canvasRef = createRef<HTMLCanvasElement>();
  const [dataTimestamp, setDatatimestamp] = useState("1");
  const [rawData, setRawData] = useState<ArrayBuffer | null>();

  useEffect(() => {
    client.safe_get(`autoProc/${autoProcId}/classification/${classificationId}/image`).then(async (response) => {
      if (response.status === 200) {
        setRawData(response.data);
        setDatatimestamp(new Date().getTime().toString());
      } else {
        setRawData(null);
      }
    });

    return () => {
      setRawData(null);
    };
  }, [autoProcId, classificationId]);

  useEffect(() => {
    window.molstar = new PluginContext(DefaultSpec);
    async function init() {
      if (!window.molstar) {
        return;
      }

      await window.molstar.init();

      if (!window.molstar.initViewer(canvasRef.current as HTMLCanvasElement, viewerDiv.current as HTMLDivElement)) {
        toast({
          ...baseToast,
          title: "Error while trying to render volume",
          description: "The volume could not be rendered because of an internal error",
          status: "error",
        });
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

    if (rawData) {
      init();
    }

    return () => {
      // See https://github.com/molstar/molstar/issues/730
      window.molstar?.animationLoop.stop();
      window.molstar?.dispose();
      window.molstar = null;
    };
  }, [rawData, viewerDiv, canvasRef, toast]);

  return (
    <VStack h='100%'>
      <Box flexGrow={5} h='90%' key={dataTimestamp} w='100%' ref={viewerDiv}>
        {rawData ? (
          <canvas ref={canvasRef} />
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
      <HStack>
        <Tooltip label='Take Screenshot'>
          <Button isDisabled={!window.molstar} onClick={() => window.molstar?.helpers.viewportScreenshot?.download()}>
            <Icon as={MdCamera} />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' />
        <Tooltip label='Reset Zoom'>
          <Button isDisabled={!window.molstar} onClick={() => window.molstar?.managers.camera.reset()}>
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
      </HStack>
    </VStack>
  );
}

export default MolstarWrapper;
