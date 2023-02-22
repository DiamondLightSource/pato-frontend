import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { createRef, useEffect, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import { Box, Button, createStandaloneToast, Heading, HStack, Icon, Skeleton, Tooltip, VStack } from "@chakra-ui/react";
import { MdCenterFocusStrong, MdFileDownload } from "react-icons/md";
import { baseToast } from "../../styles/components";
import { client } from "../../utils/api/client";

const MySpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

declare global {
  interface Window {
    molstar?: PluginContext;
  }
}

function MolstarWrapper() {
  const { toast } = createStandaloneToast();
  const viewerDiv = createRef<HTMLDivElement>();
  const canvasRef = createRef<HTMLCanvasElement>();
  const [dataTimestamp, setDatatimestamp] = useState("1");
  const [rawData, setRawData] = useState<ArrayBuffer | null>();

  useEffect(() => {
    fetch("http://localhost:3050/test.mrc").then(async (response) => {
      if (response.status === 200) {
        setRawData(await response.arrayBuffer()); //response.data);
        setDatatimestamp(new Date().getTime().toString());
      } else {
        setRawData(null);
      }
    });
  }, []);

  useEffect(() => {
    window.molstar = new PluginContext(MySpec);
    async function init() {
      if (!window.molstar) {
        return;
      }

      await window.molstar.init();

      if (!window.molstar.initViewer(canvasRef.current as HTMLCanvasElement, viewerDiv.current as HTMLDivElement)) {
        toast({
          ...baseToast,
          title: "Error while trying to render volume",
          description: "The volume could not be rendered because of an internal error, please contact the developers",
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
      window.molstar?.dispose();
    };
  }, [rawData, viewerDiv, canvasRef, toast]);

  return (
    <VStack h='100%'>
      <Box flexGrow={5} h='90%' w='100%' ref={viewerDiv}>
        {rawData ? (
          <canvas ref={canvasRef} key={dataTimestamp} />
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
        <Button>
          <Icon as={MdFileDownload} />
        </Button>
        <Tooltip label='Reset Orientation'>
          <Button>
            <Icon as={MdCenterFocusStrong} />
          </Button>
        </Tooltip>
      </HStack>
    </VStack>
  );
}

export default MolstarWrapper;
